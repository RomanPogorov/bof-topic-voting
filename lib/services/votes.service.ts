import { supabase } from "../supabase/client";
import type { Vote, CastVoteRequest, JoinTopicRequest } from "../types";
import { ErrorCodes } from "../types";
import { AnalyticsService } from "./analytics.service";

export class VotesService {
  /**
   * Join a topic (or change join to different topic)
   */
  static async joinTopic(
    participantId: string,
    request: JoinTopicRequest
  ): Promise<Vote> {
    // Use server API endpoint to bypass RLS issues
    const response = await fetch("/api/votes/cast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId,
        topicId: request.topic_id,
        bofSessionId: request.bof_session_id,
      }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || ErrorCodes.SERVER_ERROR);
    }

    const { vote } = await response.json();

    // Track analytics
    await AnalyticsService.trackVoteCast(
      participantId,
      request.topic_id,
      request.bof_session_id
    );

    return vote;
  }

  /**
   * Cast a vote (or change vote to different topic)
   * @deprecated Use joinTopic instead
   */
  static async castVote(
    participantId: string,
    request: CastVoteRequest
  ): Promise<Vote> {
    return this.joinTopic(participantId, request);
  }

  /**
   * Get user's join for a BOF session
   */
  static async getUserJoin(
    participantId: string,
    bofSessionId: string
  ): Promise<Vote | null> {
    const response = await fetch(
      `/api/votes/user?participantId=${participantId}&bofSessionId=${bofSessionId}`
    );

    if (!response.ok) {
      return null;
    }

    const { vote } = await response.json();
    return vote;
  }

  /**
   * Get user's vote for a BOF session
   * @deprecated Use getUserJoin instead
   */
  static async getUserVote(
    participantId: string,
    bofSessionId: string
  ): Promise<Vote | null> {
    return this.getUserJoin(participantId, bofSessionId);
  }

  /**
   * Leave a topic (remove join)
   */
  static async leaveTopic(
    voteId: string,
    participantId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("id", voteId)
      .eq("participant_id", participantId);

    if (error) throw new Error(ErrorCodes.SERVER_ERROR);
  }

  /**
   * Remove vote
   * @deprecated Use leaveTopic instead
   */
  static async removeVote(
    voteId: string,
    participantId: string
  ): Promise<void> {
    return this.leaveTopic(voteId, participantId);
  }

  /**
   * Get all votes for a participant
   */
  static async getParticipantVotes(participantId: string): Promise<Vote[]> {
    const { data, error } = await supabase
      .from("votes")
      .select("*")
      .eq("participant_id", participantId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(ErrorCodes.SERVER_ERROR);
    return data || [];
  }
}
