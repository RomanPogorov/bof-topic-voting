import { useState, useEffect } from "react";
import { Achievement, ParticipantAchievement } from "../types";
import { AchievementsService } from "../services/achievements.service";

export function useAchievements(participantId?: string) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<
    ParticipantAchievement[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAchievements() {
      try {
        setIsLoading(true);

        // Fetch all achievements
        const allAchievements = await AchievementsService.getAllAchievements();
        setAchievements(allAchievements);

        // Fetch earned achievements if participant ID provided
        if (participantId) {
          const earned =
            await AchievementsService.getParticipantAchievements(participantId);
          setEarnedAchievements(earned);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAchievements();
  }, [participantId]);

  const hasEarned = (achievementId: string): boolean => {
    return earnedAchievements.some((ea) => ea.achievement_id === achievementId);
  };

  const totalPoints = earnedAchievements.reduce((sum, ea: any) => {
    const achievement = achievements.find((a) => a.id === ea.achievement_id);
    return sum + (achievement?.points || 0);
  }, 0);

  return {
    achievements,
    earnedAchievements,
    isLoading,
    error,
    hasEarned,
    totalPoints,
  };
}
