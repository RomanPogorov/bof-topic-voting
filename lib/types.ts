// ============================================
// DATABASE TYPES
// ============================================

export interface Participant {
  id: string;
  name: string;
  email: string;
  company?: string;
  auth_token: string;
  avatar_url?: string;
  is_blocked: boolean;
  is_vip: boolean;
  role: "admin" | "participant";
  created_at: string;
  updated_at: string;
}

export interface ParticipantSession {
  id: string;
  participant_id: string;
  device_fingerprint: string;
  ip_address?: string;
  user_agent?: string;
  last_activity: string;
  created_at: string;
}

export interface BOFSession {
  id: string;
  day_number: number; // 1-3
  session_number: number; // 1-2
  title: string;
  description?: string;
  session_time: string;
  voting_opens_at?: string;
  voting_closes_at?: string;
  status: BOFStatus;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  bof_session_id: string;
  participant_id: string;
  title: string;
  description?: string;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  topic_id: string;
  participant_id: string;
  bof_session_id: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description?: string;
  icon: string;
  points: number;
  created_at: string;
}

export interface ParticipantAchievement {
  id: string;
  participant_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface AnalyticsEvent {
  id: string;
  participant_id?: string;
  event_type: string;
  event_data?: Record<string, unknown>;
  created_at: string;
}

// ============================================
// VIEW TYPES (computed from database)
// ============================================

export interface TopicDetails {
  topic_id: string;
  bof_session_id: string;
  title: string;
  description?: string;
  is_hidden: boolean;
  participant_id: string;
  author_id: string;
  author_name: string;
  author_company?: string;
  author_avatar?: string;
  vote_count: number;
  joined_count: number;
  voters: Array<{
    id: string;
    name: string;
    company?: string;
    avatar?: string;
  }>;
  joined_users: Array<{
    id: string;
    name: string;
    company?: string;
    avatar?: string;
    is_vip?: boolean;
  }>;
  created_at: string;
  updated_at: string;
  rank?: number;
}

export interface ParticipantStats extends Participant {
  topics_created: number;
  votes_cast: number;
  votes_received: number;
  achievements_count: number;
  total_points: number;
  rank?: number;
}

// ============================================
// ENUMS & CONSTANTS
// ============================================

export enum BOFStatus {
  UPCOMING = "upcoming",
  VOTING_OPEN = "voting_open",
  VOTING_CLOSED = "voting_closed",
  COMPLETED = "completed",
}

export enum UIState {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
  EMPTY = "empty",
}

export enum JoinState {
  NOT_JOINED = "not_joined",
  JOINED = "joined",
  LEAD = "lead",
  JOINING = "joining",
  ERROR = "error",
}

export enum TopicState {
  CREATING = "creating",
  CREATED = "created",
  ERROR = "error",
}

// ============================================
// ERROR HANDLING
// ============================================

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export const ErrorCodes = {
  // Auth errors
  INVALID_TOKEN: "INVALID_TOKEN",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  BLOCKED_USER: "BLOCKED_USER",

  // Join errors
  ALREADY_JOINED: "ALREADY_JOINED",
  JOINING_CLOSED: "JOINING_CLOSED",
  CANNOT_JOIN_OWN_TOPIC: "CANNOT_JOIN_OWN_TOPIC",

  // Topic errors
  ALREADY_CREATED_TOPIC: "ALREADY_CREATED_TOPIC",
  TOPIC_LIMIT_REACHED: "TOPIC_LIMIT_REACHED",
  INVALID_TOPIC_DATA: "INVALID_TOPIC_DATA",

  // Network errors
  NETWORK_ERROR: "NETWORK_ERROR",
  SERVER_ERROR: "SERVER_ERROR",

  // Unknown
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ============================================
// API TYPES
// ============================================

export interface CreateTopicRequest {
  bof_session_id: string;
  title: string;
  description?: string;
}

export interface CastVoteRequest {
  topic_id: string;
  bof_session_id: string;
}

export interface JoinTopicRequest {
  topic_id: string;
  bof_session_id: string;
}

export interface GenerateQRRequest {
  participants: Array<{
    name: string;
    email: string;
    company?: string;
  }>;
}

export interface AuthResponse {
  participant: Participant;
  session: ParticipantSession;
}

// ============================================
// ACHIEVEMENT CODES
// ============================================

export const ACHIEVEMENT_CODES = {
  FIRST_VOTER: "first_voter",
  FIRST_TOPIC: "first_topic",
  ACTIVE_VOTER: "active_voter",
  TOPIC_CREATOR: "topic_creator",
  POPULAR_TOPIC: "popular_topic",
  TOP_FIVE: "top_five",
  SOCIAL_BUTTERFLY: "social_butterfly",
  NIGHT_OWL: "night_owl",
  EARLY_BIRD: "early_bird",
} as const;

export type AchievementCode =
  (typeof ACHIEVEMENT_CODES)[keyof typeof ACHIEVEMENT_CODES];
