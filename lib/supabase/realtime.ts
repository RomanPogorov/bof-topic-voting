import { supabase } from "./client";
import { RealtimeChannel } from "@supabase/supabase-js";

export function subscribeToBOFUpdates(
  bofId: string,
  onUpdate: (payload: any) => void
): () => void {
  const channel: RealtimeChannel = supabase.channel(`bof_${bofId}`);

  // Subscribe to votes
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "votes",
      filter: `bof_session_id=eq.${bofId}`,
    },
    onUpdate
  );

  // Subscribe to topics
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "topics",
      filter: `bof_session_id=eq.${bofId}`,
    },
    onUpdate
  );

  channel.subscribe();

  return () => {
    channel.unsubscribe();
  };
}

export function subscribeToLeaderboard(
  onUpdate: (payload: any) => void
): () => void {
  const channel: RealtimeChannel = supabase.channel("leaderboard");

  // Subscribe to participant achievements
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "participant_achievements",
    },
    onUpdate
  );

  channel.subscribe();

  return () => {
    channel.unsubscribe();
  };
}
