import { supabase } from "../supabase/client";
import { Topic, CreateTopicRequest, ErrorCodes, BOFStatus } from "../types";
import { AnalyticsService } from "./analytics.service";

export class TopicsService {
  /**
   * Get all topics for a BOF session
   */
  static async getTopics(bofSessionId: string): Promise<Topic[]> {
    const { data, error } = await supabase
      .from("topic_details")
      .select("*")
      .eq("bof_session_id", bofSessionId)
      .order("vote_count", { ascending: false });

    if (error) throw new Error(ErrorCodes.SERVER_ERROR);
    return (data as any) || [];
  }

  /**
   * Get a single topic by ID
   */
  static async getTopic(topicId: string): Promise<Topic | null> {
    const { data, error } = await supabase
      .from("topic_details")
      .select("*")
      .eq("topic_id", topicId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Create a new topic
   */
  static async createTopic(
    participantId: string,
    request: CreateTopicRequest
  ): Promise<Topic> {
    // Admin server route (bypass status/RLS) if available
    const resp = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, ...request }),
    });
    if (resp.ok) {
      const { topic } = (await resp.json()) as { topic: Topic };
      return topic;
    }

    // Fallback to client insert
    const { data: existing } = await supabase
      .from("topics")
      .select("id")
      .eq("bof_session_id", request.bof_session_id)
      .eq("participant_id", participantId)
      .single();
    if (existing) throw new Error(ErrorCodes.ALREADY_CREATED_TOPIC);

    const { data, error } = await supabase
      .from("topics")
      .insert({
        bof_session_id: request.bof_session_id,
        participant_id: participantId,
        title: request.title,
        description: request.description,
      })
      .select()
      .single<Topic>();

    if (error || !data) throw new Error(ErrorCodes.SERVER_ERROR);
    return data;
  }

  /**
   * Get topics created by a participant
   */
  static async getParticipantTopics(
    participantId: string
  ): Promise<Topic[]> {
    const { data, error } = await supabase
      .from("topic_details")
      .select("*")
      .eq("author_id", participantId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(ErrorCodes.SERVER_ERROR);
    return (data as any) || [];
  }

  /**
   * Hide/unhide topic (admin)
   */
  static async toggleTopicVisibility(
    topicId: string,
    isHidden: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from("topics")
      .update({ is_hidden: isHidden })
      .eq("id", topicId);

    if (error) throw new Error(ErrorCodes.SERVER_ERROR);
  }
}
