import { supabase } from "../supabase/client";
import type { Topic, TopicDetails, CreateTopicRequest } from "../types";
import { ErrorCodes } from "../types";

export class TopicsService {
  /**
   * Get all topics for a BOF session
   */
  static async getTopics(bofSessionId: string): Promise<TopicDetails[]> {
    const { data, error } = await supabase
      .from("topic_details")
      .select("*")
      .eq("bof_session_id", bofSessionId)
      .order("vote_count", { ascending: false });

    if (error) throw new Error(ErrorCodes.SERVER_ERROR);
    return (data as TopicDetails[]) || [];
  }

  /**
   * Get a single topic by ID
   */
  static async getTopic(topicId: string): Promise<TopicDetails | null> {
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
    topicData: CreateTopicRequest
  ): Promise<Topic> {
    const resp = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, ...topicData }),
    });

    if (!resp.ok) {
      const { error } = await resp.json();
      console.error("API error:", error);
      if (error === "ALREADY_CREATED_TOPIC") {
        throw new Error(ErrorCodes.ALREADY_CREATED_TOPIC);
      }
      throw new Error(error || ErrorCodes.SERVER_ERROR);
    }
    const { topic } = await resp.json();
    return topic;
  }

  static async updateTopic(
    topicId: string,
    data: { title: string; description?: string }
  ): Promise<Topic> {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("Session expired. Please scan your QR code again");
    }

    const resp = await fetch(`/api/admin/topics/${topicId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!resp.ok) {
      const { error } = await resp.json();

      // Handle auth errors with user-friendly message
      if (resp.status === 401 || resp.status === 403) {
        throw new Error("Session expired. Please scan your QR code again");
      }

      throw new Error(error || "Failed to update topic");
    }

    const { topic } = await resp.json();
    return topic;
  }

  static async deleteTopicAsAdmin(topicId: string): Promise<void> {
    // We need to pass the user's auth token to the backend so it can
    // verify that the user is an admin.
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("Session expired. Please scan your QR code again");
    }

    const resp = await fetch(`/api/admin/topics/${topicId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!resp.ok) {
      const { error } = await resp.json();

      // Handle auth errors with user-friendly message
      if (resp.status === 401 || resp.status === 403) {
        throw new Error("Session expired. Please scan your QR code again");
      }

      throw new Error(error || "Failed to delete topic");
    }
  }

  /**
   * Get topics created by a participant
   */
  static async getParticipantTopics(
    participantId: string
  ): Promise<TopicDetails[]> {
    const { data, error } = await supabase
      .from("topic_details")
      .select("*")
      .eq("author_id", participantId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(ErrorCodes.SERVER_ERROR);
    return (data as TopicDetails[]) || [];
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

  /**
   * Move topic to another BOF session (admin)
   */
  static async moveTopicToSession(
    topicId: string,
    targetSessionId: string
  ): Promise<void> {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("Session expired. Please scan your QR code again");
    }

    const resp = await fetch(`/api/admin/topics/${topicId}/move`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetSessionId }),
    });

    if (!resp.ok) {
      const { error } = await resp.json();

      if (resp.status === 401 || resp.status === 403) {
        throw new Error("Session expired. Please scan your QR code again");
      }

      throw new Error(error || "Failed to move topic");
    }
  }
}
