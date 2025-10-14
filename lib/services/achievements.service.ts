import { supabase } from "../supabase/client";
import {
  Achievement,
  ParticipantAchievement,
  AchievementCode,
  ErrorCodes,
} from "../types";

export class AchievementsService {
  /**
   * Get all achievements
   */
  static async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .order("points", { ascending: false });

    if (error) throw new Error(ErrorCodes.SERVER_ERROR);
    return data || [];
  }

  /**
   * Get participant's earned achievements
   */
  static async getParticipantAchievements(
    participantId: string
  ): Promise<ParticipantAchievement[]> {
    const { data, error } = await supabase
      .from("participant_achievements")
      .select("*, achievement:achievements(*)")
      .eq("participant_id", participantId)
      .order("earned_at", { ascending: false });

    if (error) throw new Error(ErrorCodes.SERVER_ERROR);
    return data || [];
  }

  /**
   * Award achievement to participant
   */
  static async awardAchievement(
    participantId: string,
    achievementCode: AchievementCode
  ): Promise<void> {
    // Get achievement by code
    const { data: achievement } = await supabase
      .from("achievements")
      .select("id")
      .eq("code", achievementCode)
      .single();

    if (!achievement) return;

    // Award achievement (upsert to avoid duplicates)
    await supabase.from("participant_achievements").upsert(
      {
        participant_id: participantId,
        achievement_id: achievement.id,
      },
      {
        onConflict: "participant_id,achievement_id",
        ignoreDuplicates: true,
      }
    );
  }

  /**
   * Check and award vote-related achievements
   */
  static async checkVoteAchievements(
    participantId: string,
    bofId: string
  ): Promise<AchievementCode[]> {
    const awarded: AchievementCode[] = [];

    // Check first voter
    const { count: voteCount } = await supabase
      .from("votes")
      .select("id", { count: "exact", head: true })
      .eq("bof_session_id", bofId);

    if (voteCount === 1) {
      await this.awardAchievement(participantId, "first_voter");
      awarded.push("first_voter");
    }

    // Check active voter (voted in all 6 BOF)
    const { count: userVoteCount } = await supabase
      .from("votes")
      .select("bof_session_id", { count: "exact", head: true })
      .eq("participant_id", participantId);

    if (userVoteCount === 6) {
      await this.awardAchievement(participantId, "active_voter");
      awarded.push("active_voter");
    }

    // Check social butterfly (voted in first hour)
    const { data: bof } = await supabase
      .from("bof_sessions")
      .select("voting_opens_at")
      .eq("id", bofId)
      .single();

    if (bof?.voting_opens_at) {
      const timeSinceOpen =
        Date.now() - new Date(bof.voting_opens_at).getTime();
      if (timeSinceOpen < 3600000) {
        // 1 hour in ms
        await this.awardAchievement(participantId, "social_butterfly");
        awarded.push("social_butterfly");
      }
    }

    // Check night owl / early bird
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      await this.awardAchievement(participantId, "night_owl");
      awarded.push("night_owl");
    } else if (hour < 8) {
      await this.awardAchievement(participantId, "early_bird");
      awarded.push("early_bird");
    }

    return awarded;
  }

  /**
   * Check and award topic-related achievements
   */
  static async checkTopicAchievements(
    participantId: string,
    bofId: string
  ): Promise<AchievementCode[]> {
    const awarded: AchievementCode[] = [];

    // Check first topic
    const { count: topicCount } = await supabase
      .from("topics")
      .select("id", { count: "exact", head: true })
      .eq("bof_session_id", bofId);

    if (topicCount === 1) {
      await this.awardAchievement(participantId, "first_topic");
      awarded.push("first_topic");
    }

    // Check topic creator (3+ topics)
    const { count: userTopicCount } = await supabase
      .from("topics")
      .select("id", { count: "exact", head: true })
      .eq("participant_id", participantId)
      .eq("is_hidden", false);

    if (userTopicCount && userTopicCount >= 3) {
      await this.awardAchievement(participantId, "topic_creator");
      awarded.push("topic_creator");
    }

    return awarded;
  }

  /**
   * Check and award topic popularity achievements
   */
  static async checkTopicPopularityAchievements(
    topicId: string
  ): Promise<AchievementCode[]> {
    const awarded: AchievementCode[] = [];

    // Get topic details
    const { data: topic } = await supabase
      .from("topic_details")
      .select("*")
      .eq("topic_id", topicId)
      .single();

    if (!topic) return awarded;

    // Check popular topic (10+ votes)
    if (topic.vote_count >= 10) {
      await this.awardAchievement(topic.author_id, "popular_topic");
      awarded.push("popular_topic");
    }

    // Check top five
    if (topic.rank && topic.rank <= 5) {
      await this.awardAchievement(topic.author_id, "top_five");
      awarded.push("top_five");
    }

    return awarded;
  }
}
