export const ROUTES = {
  // Auth
  AUTH: (token: string) => `/auth/${token}`,
  ACCESS_DENIED: "/access-denied",

  // Mobile
  HOME: "/",
  BOF: (id: string) => `/bof/${id}`,
  TOPIC: (id: string) => `/topic/${id}`,
  PROFILE: "/profile",
  LEADERBOARD: "/leaderboard",
  MY_TOPICS: "/my-topics",

  // TV Display
  TV: "/tv",
  TV_DISPLAY: (id: string) => `/tv/${id}`,
  TV_LEADERBOARD: "/tv/leaderboard",

  // Admin
  ADMIN: "/admin",
  ADMIN_PARTICIPANTS: "/admin/participants",
  ADMIN_ADD_PARTICIPANTS: "/admin/add-participants",
  ADMIN_QR: "/admin/generate-qr",
  ADMIN_SESSIONS: "/admin/bof-sessions",
  ADMIN_MODERATION: "/admin/moderation",
  ADMIN_ANALYTICS: "/admin/analytics",

  // API
  API_AUTH_VERIFY: "/api/auth/verify",
  API_AUTH_LOGOUT: "/api/auth/logout",
  API_TOPICS: "/api/topics",
  API_TOPIC: (id: string) => `/api/topics/${id}`,
  API_VOTES: "/api/votes",
  API_VOTE: (id: string) => `/api/votes/${id}`,
  API_BOF: (id: string) => `/api/bof/${id}`,
  API_BOF_STATS: (id: string) => `/api/bof/${id}/stats`,
  API_ACHIEVEMENTS: "/api/achievements",
  API_ACHIEVEMENTS_CHECK: "/api/achievements/check",
  API_LEADERBOARD: "/api/leaderboard",
  API_QR_GENERATE: "/api/qr-generate",
} as const;
