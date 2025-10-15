import { supabase } from "../supabase/client";

export class AnalyticsService {
  /**
   * Track an analytics event
   */
  static async track(params: {
    participant_id?: string;
    event_type: string;
    event_data?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await supabase.from("analytics_events").insert({
        participant_id: params.participant_id || null,
        event_type: params.event_type,
        event_data: params.event_data || {},
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to track analytics event:", error);
    }
  }

  /**
   * Track page view
   */
  static async trackPageView(
    participantId: string,
    page: string
  ): Promise<void> {
    await this.track({
      participant_id: participantId,
      event_type: "page_view",
      event_data: { page },
    });
  }

  /**
   * Track vote cast
   */
  static async trackVoteCast(
    participantId: string,
    topicId: string,
    bofId: string
  ): Promise<void> {
    await this.track({
      participant_id: participantId,
      event_type: "vote_cast",
      event_data: { topic_id: topicId, bof_session_id: bofId },
    });
  }

  /**
   * Track topic created
   */
  static async trackTopicCreated(
    participantId: string,
    topicId: string,
    bofId: string
  ): Promise<void> {
    await this.track({
      participant_id: participantId,
      event_type: "topic_created",
      event_data: { topic_id: topicId, bof_session_id: bofId },
    });
  }
}
