-- ============================================
-- BOF VOTING SYSTEM - DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PARTICIPANTS
-- ============================================
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  company VARCHAR(255),
  auth_token VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PARTICIPANT SESSIONS (multi-device tracking)
-- ============================================
CREATE TABLE participant_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  device_fingerprint VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- BOF SESSIONS
-- ============================================
CREATE TABLE bof_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 3),
  session_number INTEGER NOT NULL CHECK (session_number BETWEEN 1 AND 2),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  session_time TIMESTAMP NOT NULL,
  voting_opens_at TIMESTAMP,
  voting_closes_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(day_number, session_number)
);

-- ============================================
-- TOPICS
-- ============================================
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bof_session_id UUID REFERENCES bof_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(bof_session_id, participant_id)
);

-- ============================================
-- VOTES
-- ============================================
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  bof_session_id UUID REFERENCES bof_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(bof_session_id, participant_id)
);

-- ============================================
-- GAMIFICATION: Achievements
-- ============================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- GAMIFICATION: Participant Achievements
-- ============================================
CREATE TABLE participant_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(participant_id, achievement_id)
);

-- ============================================
-- ANALYTICS: Events
-- ============================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_topics_bof ON topics(bof_session_id);
CREATE INDEX idx_topics_participant ON topics(participant_id);
CREATE INDEX idx_votes_topic ON votes(topic_id);
CREATE INDEX idx_votes_bof ON votes(bof_session_id);
CREATE INDEX idx_votes_participant ON votes(participant_id);
CREATE INDEX idx_participants_token ON participants(auth_token);
CREATE INDEX idx_sessions_participant ON participant_sessions(participant_id);
CREATE INDEX idx_sessions_activity ON participant_sessions(last_activity);
CREATE INDEX idx_achievements_participant ON participant_achievements(participant_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);

-- ============================================
-- VIEWS: Topic Details with Vote Counts
-- ============================================
CREATE VIEW topic_details AS
SELECT 
  t.id as topic_id,
  t.bof_session_id,
  t.title,
  t.description,
  t.is_hidden,
  t.participant_id as author_id,
  p.name as author_name,
  p.company as author_company,
  p.avatar_url as author_avatar,
  COUNT(DISTINCT v.id) as vote_count,
  ARRAY_AGG(
    DISTINCT jsonb_build_object(
      'id', vp.id,
      'name', vp.name,
      'company', vp.company,
      'avatar', vp.avatar_url
    )
  ) FILTER (WHERE vp.id IS NOT NULL) as voters,
  t.created_at,
  t.updated_at
FROM topics t
LEFT JOIN votes v ON t.id = v.topic_id
LEFT JOIN participants p ON t.participant_id = p.id
LEFT JOIN participants vp ON v.participant_id = vp.id
WHERE t.is_hidden = FALSE
GROUP BY t.id, t.bof_session_id, t.title, t.description, t.is_hidden, 
         t.participant_id, p.name, p.company, p.avatar_url, t.created_at, t.updated_at;

-- ============================================
-- VIEWS: Top Topics per BOF
-- ============================================
CREATE VIEW top_topics AS
SELECT 
  topic_id,
  bof_session_id,
  title,
  description,
  author_id,
  author_name,
  author_company,
  vote_count,
  voters,
  ROW_NUMBER() OVER (PARTITION BY bof_session_id ORDER BY vote_count DESC, created_at ASC) as rank
FROM topic_details
WHERE vote_count > 0;

-- ============================================
-- VIEWS: Participant Stats (for leaderboard)
-- ============================================
CREATE VIEW participant_stats AS
SELECT 
  p.id,
  p.name,
  p.company,
  p.avatar_url,
  COUNT(DISTINCT t.id) as topics_created,
  COUNT(DISTINCT v.id) as votes_cast,
  COALESCE(SUM(td.vote_count), 0) as votes_received,
  COUNT(DISTINCT pa.achievement_id) as achievements_count,
  COALESCE(SUM(a.points), 0) as total_points
FROM participants p
LEFT JOIN topics t ON p.id = t.participant_id AND t.is_hidden = FALSE
LEFT JOIN votes v ON p.id = v.participant_id
LEFT JOIN topic_details td ON t.id = td.topic_id
LEFT JOIN participant_achievements pa ON p.id = pa.participant_id
LEFT JOIN achievements a ON pa.achievement_id = a.id
GROUP BY p.id, p.name, p.company, p.avatar_url;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_achievements ENABLE ROW LEVEL SECURITY;

-- Policies: everyone can read, but modify only own data
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (is_hidden = FALSE);
CREATE POLICY "Public read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Public read achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users insert own data" ON topics FOR INSERT WITH CHECK (true);
CREATE POLICY "Users insert own votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own votes" ON votes FOR UPDATE USING (true);
CREATE POLICY "Users delete own votes" ON votes FOR DELETE USING (true);

-- ============================================
-- FUNCTIONS: Auto-award Achievements
-- ============================================
CREATE OR REPLACE FUNCTION award_achievement(
  p_participant_id UUID,
  p_achievement_code VARCHAR
) RETURNS VOID AS $$
BEGIN
  INSERT INTO participant_achievements (participant_id, achievement_id)
  SELECT p_participant_id, id
  FROM achievements
  WHERE code = p_achievement_code
  ON CONFLICT (participant_id, achievement_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS: Auto-award Achievements
-- ============================================

-- First Voter
CREATE OR REPLACE FUNCTION check_first_voter() RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM votes WHERE bof_session_id = NEW.bof_session_id) = 1 THEN
    PERFORM award_achievement(NEW.participant_id, 'first_voter');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_first_voter
AFTER INSERT ON votes
FOR EACH ROW
EXECUTE FUNCTION check_first_voter();

-- First Topic
CREATE OR REPLACE FUNCTION check_first_topic() RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM topics WHERE bof_session_id = NEW.bof_session_id) = 1 THEN
    PERFORM award_achievement(NEW.participant_id, 'first_topic');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_first_topic
AFTER INSERT ON topics
FOR EACH ROW
EXECUTE FUNCTION check_first_topic();

-- ============================================
-- SEED DATA: Base Achievements
-- ============================================
INSERT INTO achievements (code, title, description, icon, points) VALUES
('first_voter', 'First Voter', 'Voted first in a BOF session', '🚀', 50),
('first_topic', 'First Topic', 'Created the first topic in a BOF session', '💡', 50),
('active_voter', 'Active Voter', 'Voted in all 6 BOF sessions', '🗳️', 100),
('topic_creator', 'Topic Creator', 'Created 3+ topics', '✍️', 75),
('popular_topic', 'Popular Topic', 'Your topic received 10+ votes', '🔥', 150),
('top_five', 'Top Five', 'Your topic made it to top 5', '⭐', 200),
('social_butterfly', 'Social Butterfly', 'Voted within first hour of opening', '🦋', 30),
('night_owl', 'Night Owl', 'Voted after 10 PM', '🦉', 25),
('early_bird', 'Early Bird', 'Voted before 8 AM', '🐦', 25);

-- ============================================
-- SEED DATA: 6 BOF Sessions (3 days × 2 sessions)
-- ============================================
INSERT INTO bof_sessions (day_number, session_number, title, description, session_time, voting_opens_at, voting_closes_at, status) VALUES
(1, 1, 'BOF Morning Session', 'Morning Birds of a Feather Session', '2025-10-20 10:00:00', '2025-10-19 18:00:00', '2025-10-20 09:30:00', 'upcoming'),
(1, 2, 'BOF Afternoon Session', 'Afternoon Birds of a Feather Session', '2025-10-20 15:00:00', '2025-10-20 10:30:00', '2025-10-20 14:30:00', 'upcoming'),
(2, 1, 'BOF Morning Session', 'Morning Birds of a Feather Session', '2025-10-21 10:00:00', '2025-10-20 18:00:00', '2025-10-21 09:30:00', 'upcoming'),
(2, 2, 'BOF Afternoon Session', 'Afternoon Birds of a Feather Session', '2025-10-21 15:00:00', '2025-10-21 10:30:00', '2025-10-21 14:30:00', 'upcoming'),
(3, 1, 'BOF Morning Session', 'Morning Birds of a Feather Session', '2025-10-22 10:00:00', '2025-10-21 18:00:00', '2025-10-22 09:30:00', 'upcoming'),
(3, 2, 'BOF Final Session', 'Final Birds of a Feather Session', '2025-10-22 15:00:00', '2025-10-22 10:30:00', '2025-10-22 14:30:00', 'upcoming');

