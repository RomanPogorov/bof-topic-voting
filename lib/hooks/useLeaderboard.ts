import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import { ParticipantStats } from "../types";

export function useLeaderboard() {
  const [participants, setParticipants] = useState<ParticipantStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("participant_stats")
          .select("*")
          .order("total_points", { ascending: false })
          .order("votes_received", { ascending: false })
          .order("topics_created", { ascending: false });

        if (error) throw error;

        // Add rank
        const rankedData = (data || []).map((p, index) => ({
          ...p,
          rank: index + 1,
        }));

        setParticipants(rankedData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();

    // Refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);

    return () => clearInterval(interval);
  }, []);

  return { participants, isLoading, error };
}
