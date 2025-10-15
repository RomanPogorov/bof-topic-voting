import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import type { BOFSession } from "../types";

export function useBOFSessions() {
  const [sessions, setSessions] = useState<BOFSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("bof_sessions")
          .select("*")
          .order("day_number", { ascending: true })
          .order("session_time", { ascending: true });

        if (error) throw error;
        setSessions(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSessions();
  }, []);

  return { sessions, isLoading, error };
}
