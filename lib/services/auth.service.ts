import { supabase } from "../supabase/client";
import { getDeviceInfo } from "../utils/fingerprint";
import {
  AuthResponse,
  Participant,
  ParticipantSession,
  ErrorCodes,
} from "../types";

export class AuthService {
  /**
   * Verify token and create/update session with multi-device protection
   */
  static async verifyAndCreateSession(token: string): Promise<AuthResponse> {
    // 1. Get device fingerprint
    const deviceInfo = await getDeviceInfo();

    // 2. Call server route to verify and upsert session using service role
    const resp = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, device: deviceInfo }),
    });

    if (!resp.ok) {
      const { error } = await resp.json();
      switch (error) {
        case "INVALID_TOKEN":
          throw new Error(ErrorCodes.INVALID_TOKEN);
        case "BLOCKED_USER":
          throw new Error(ErrorCodes.BLOCKED_USER);
        default:
          throw new Error(ErrorCodes.SERVER_ERROR);
      }
    }

    const { participant, session } = (await resp.json()) as {
      participant: Participant;
      session: ParticipantSession;
    };

    // 3. Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("participant_id", participant.id);
      localStorage.setItem("session_id", session.id);
    }

    // 4. Log analytics event (client ok)
    await supabase.from("analytics_events").insert({
      participant_id: participant.id,
      event_type: "qr_scanned",
      event_data: {
        device_fingerprint: deviceInfo.fingerprint,
        ip_address: deviceInfo.ipAddress,
      },
    });

    return { participant, session };
  }

  /**
   * Check if session is valid and update last activity
   */
  static async checkSession(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    const token = localStorage.getItem("auth_token");
    const sessionId = localStorage.getItem("session_id");

    if (!token || !sessionId) {
      throw new Error(ErrorCodes.SESSION_EXPIRED);
    }

    // Update last activity
    const { error } = await supabase
      .from("participant_sessions")
      .update({ last_activity: new Date().toISOString() })
      .eq("id", sessionId);

    if (error) {
      throw new Error(ErrorCodes.SESSION_EXPIRED);
    }

    return true;
  }

  /**
   * Get current participant
   */
  static async getCurrentParticipant(): Promise<Participant | null> {
    if (typeof window === "undefined") return null;

    const participantId = localStorage.getItem("participant_id");
    if (!participantId) return null;

    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("id", participantId)
      .single<Participant>();

    if (error || !data) return null;

    return data;
  }

  /**
   * Logout - clear session
   */
  static async logout(): Promise<void> {
    if (typeof window === "undefined") return;

    const sessionId = localStorage.getItem("session_id");
    const participantId = localStorage.getItem("participant_id");

    // Log analytics event
    if (participantId) {
      await supabase.from("analytics_events").insert({
        participant_id: participantId,
        event_type: "logout",
        event_data: {},
      });
    }

    // Delete session from database
    if (sessionId) {
      await supabase.from("participant_sessions").delete().eq("id", sessionId);
    }

    // Clear localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("participant_id");
    localStorage.removeItem("session_id");
  }
}
