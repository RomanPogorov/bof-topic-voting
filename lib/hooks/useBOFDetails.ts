import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import type { BOFSession, TopicDetails, Vote } from "../types";
import { subscribeToBOFUpdates } from "../supabase/realtime";

export function useBOFDetails(bofId: string, participantId?: string) {
  const [bof, setBof] = useState<BOFSession | null>(null);
  const [topics, setTopics] = useState<TopicDetails[]>([]);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch BOF session
        const { data: bofData, error: bofError } = await supabase
          .from("bof_sessions")
          .select("*")
          .eq("id", bofId)
          .single<BOFSession>();

        if (bofError) throw bofError;
        setBof(bofData);

        // Fetch topics
        const { data: topicsData, error: topicsError } = await supabase
          .from("topic_details")
          .select("*")
          .eq("bof_session_id", bofId)
          .order("vote_count", { ascending: false })
          .order("created_at", { ascending: true });

        if (topicsError) throw topicsError;
        setTopics(topicsData || []);

        // Fetch user's vote if logged in
        if (participantId) {
          const { data: voteData } = await supabase
            .from("votes")
            .select("*")
            .eq("bof_session_id", bofId)
            .eq("participant_id", participantId)
            .maybeSingle<Vote>();

          setUserVote(voteData);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToBOFUpdates(bofId, () => {
      fetchData();
    });

    return () => {
      unsubscribe();
    };
  }, [bofId, participantId]);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const { data: topicsData } = await supabase
        .from("topic_details")
        .select("*")
        .eq("bof_session_id", bofId)
        .order("vote_count", { ascending: false })
        .order("created_at", { ascending: true });

      setTopics(topicsData || []);

      if (participantId) {
        const { data: voteData } = await supabase
          .from("votes")
          .select("*")
          .eq("bof_session_id", bofId)
          .eq("participant_id", participantId)
          .maybeSingle<Vote>();

        setUserVote(voteData);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { bof, topics, userVote, isLoading, error, refresh };
}
