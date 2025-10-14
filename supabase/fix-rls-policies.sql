-- ============================================
-- FIX RLS POLICIES FOR VOTING SYSTEM
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public read votes" ON votes;
DROP POLICY IF EXISTS "Users insert own votes" ON votes;
DROP POLICY IF EXISTS "Users update own votes" ON votes;
DROP POLICY IF EXISTS "Users delete own votes" ON votes;

-- Create new policies that allow anonymous access
-- Everyone can read votes
CREATE POLICY "Anyone can read votes" ON votes FOR SELECT USING (true);

-- Anyone can insert votes (for anonymous voting)
CREATE POLICY "Anyone can insert votes" ON votes FOR INSERT WITH CHECK (true);

-- Anyone can update votes (for changing votes)
CREATE POLICY "Anyone can update votes" ON votes FOR UPDATE USING (true);

-- Anyone can delete votes (for removing votes)
CREATE POLICY "Anyone can delete votes" ON votes FOR DELETE USING (true);

-- Also fix topics policies
DROP POLICY IF EXISTS "Users insert own data" ON topics;
CREATE POLICY "Anyone can insert topics" ON topics FOR INSERT WITH CHECK (true);

-- Fix participant_sessions policies
DROP POLICY IF EXISTS "Users insert own sessions" ON participant_sessions;
CREATE POLICY "Anyone can insert sessions" ON participant_sessions FOR INSERT WITH CHECK (true);

-- Fix participant_achievements policies  
DROP POLICY IF EXISTS "Users insert own achievements" ON participant_achievements;
CREATE POLICY "Anyone can insert achievements" ON participant_achievements FOR INSERT WITH CHECK (true);

-- Fix analytics_events policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
