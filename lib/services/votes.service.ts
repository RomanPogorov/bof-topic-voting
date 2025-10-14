import { supabase } from "../supabase/client";
import { Vote, CastVoteRequest, ErrorCodes, BOFStatus } from "../types";
import { AnalyticsService } from "./analytics.service";

export class VotesService {
  /**
   * Cast a vote (or change vote to different topic)
   */
  static async castVote(
    participantId: string,
    request: CastVoteRequest
  ): Promise<Vote> {
    // 1. Check if voting is open
    const { data: bof } = await supabase
      .from("bof_sessions")
      .select("status")
      .eq("id", request.bof_session_id)
      .single();

    if (!bof || bof.status !== BOFStatus.VOTING_OPEN) {
      throw new Error(ErrorCodes.VOTING_CLOSED);
    }

    // 2. Check if voting for own topic
    const { data: topic } = await supabase
      .from("topics")
      .select("participant_id")
      .eq("id", request.topic_id)
      .single();

    if (topic && topic.participant_id === participantId) {
      throw new Error(ErrorCodes.CANNOT_VOTE_OWN_TOPIC);
    }

    // 3. Check if user already voted in this BOF
    const { data: existingVote } = await supabase
      .from("votes")
      .select("*")
      .eq("bof_session_id", request.bof_session_id)
      .eq("participant_id", participantId)
      .single();

    // 4. If voted, update to new topic
    if (existingVote) {
      const { data, error } = await supabase
        .from("votes")
        .update({
          topic_id: request.topic_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingVote.id)
        .select()
        .single<Vote>();

      if (error || !data) {
        throw new Error(ErrorCodes.SERVER_ERROR);
      }

      await AnalyticsService.trackVoteCast(
        participantId,
        request.topic_id,
        request.bof_session_id
      );

      return data;
    }

    // 5. Otherwise, create new vote
    const { data, error } = await supabase
      .from("votes")
      .insert({
        topic_id: request.topic_id,
        participant_id: participantId,
        bof_session_id: request.bof_session_id,
      })
      .select()
      .single<Vote>();

    if (error || !data) {
      throw new Error(ErrorCodes.SERVER_ERROR);
    }

    await AnalyticsService.trackVoteCast(
      participantId,
      request.topic_id,
      request.bof_session_id
    );

    return data;
  }

  /**
   * Get user's vote for a BOF session
   */
  static async getUserVote(
    participantId: string,
    bofSessionId: string
  ): Promise<Vote | null> {
    const { data, error } = await supabase
      .from("votes")
      .select("*")
      .eq("participant_id", participantId)
      .eq("bof_session_id", bofSessionId)
      .single<Vote>();

    if (error) return null;
    return data;
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
