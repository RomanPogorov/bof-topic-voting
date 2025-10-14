import { supabase } from "../supabase/client";
import type { Vote, CastVoteRequest } from "../types";
import { ErrorCodes } from "../types";
import { AnalyticsService } from "./analytics.service";

export class VotesService {
  /**
   * Cast a vote (or change vote to different topic)
   */
  static async castVote(
    participantId: string,
    request: CastVoteRequest
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
   * Get user's vote for a BOF session
   */
  static async getUserVote(
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
   * Remove vote
   */
  static async removeVote(
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
