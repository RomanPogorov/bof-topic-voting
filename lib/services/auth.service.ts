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
    // 1. Verify token and get participant
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("*")
      .eq("auth_token", token)
      .single<Participant>();

    if (participantError || !participant) {
      throw new Error(ErrorCodes.INVALID_TOKEN);
    }

    if (participant.is_blocked) {
      throw new Error(ErrorCodes.BLOCKED_USER);
    }

    // 2. Get device fingerprint
    const deviceInfo = await getDeviceInfo();

    // 3. Create or update session
    const { data: session, error: sessionError } = await supabase
      .from("participant_sessions")
      .upsert({
        participant_id: participant.id,
        device_fingerprint: deviceInfo.fingerprint,
        ip_address: deviceInfo.ipAddress,
        user_agent: deviceInfo.userAgent,
        last_activity: new Date().toISOString(),
      })
      .select()
      .single<ParticipantSession>();

    if (sessionError || !session) {
      throw new Error(ErrorCodes.SERVER_ERROR);
    }

    // 4. Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("participant_id", participant.id);
      localStorage.setItem("session_id", session.id);
    }

    // 5. Log analytics event
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
