import { ACHIEVEMENT_CODES } from "../types";

export const ACHIEVEMENTS = {
  [ACHIEVEMENT_CODES.FIRST_VOTER]: {
    code: ACHIEVEMENT_CODES.FIRST_VOTER,
    title: "🚀 First Voter",
    description: "Voted first in a BOF session",
    icon: "🚀",
    points: 50,
  },
  [ACHIEVEMENT_CODES.FIRST_TOPIC]: {
    code: ACHIEVEMENT_CODES.FIRST_TOPIC,
    title: "💡 First Topic",
    description: "Created the first topic in a BOF session",
    icon: "💡",
    points: 50,
  },
  [ACHIEVEMENT_CODES.ACTIVE_VOTER]: {
    code: ACHIEVEMENT_CODES.ACTIVE_VOTER,
    title: "🗳️ Active Voter",
    description: "Voted in all 6 BOF sessions",
    icon: "🗳️",
    points: 100,
  },
  [ACHIEVEMENT_CODES.TOPIC_CREATOR]: {
    code: ACHIEVEMENT_CODES.TOPIC_CREATOR,
    title: "✍️ Topic Creator",
    description: "Created 3+ topics",
    icon: "✍️",
    points: 75,
  },
  [ACHIEVEMENT_CODES.POPULAR_TOPIC]: {
    code: ACHIEVEMENT_CODES.POPULAR_TOPIC,
    title: "🔥 Popular Topic",
    description: "Your topic received 10+ votes",
    icon: "🔥",
    points: 150,
  },
  [ACHIEVEMENT_CODES.TOP_FIVE]: {
    code: ACHIEVEMENT_CODES.TOP_FIVE,
    title: "⭐ Top Five",
    description: "Your topic made it to top 5",
    icon: "⭐",
    points: 200,
  },
  [ACHIEVEMENT_CODES.SOCIAL_BUTTERFLY]: {
    code: ACHIEVEMENT_CODES.SOCIAL_BUTTERFLY,
    title: "🦋 Social Butterfly",
    description: "Voted within first hour of opening",
    icon: "🦋",
    points: 30,
  },
  [ACHIEVEMENT_CODES.NIGHT_OWL]: {
    code: ACHIEVEMENT_CODES.NIGHT_OWL,
    title: "🦉 Night Owl",
    description: "Voted after 10 PM",
    icon: "🦉",
    points: 25,
  },
  [ACHIEVEMENT_CODES.EARLY_BIRD]: {
    code: ACHIEVEMENT_CODES.EARLY_BIRD,
    title: "🐦 Early Bird",
    description: "Voted before 8 AM",
    icon: "🐦",
    points: 25,
  },
} as const;
