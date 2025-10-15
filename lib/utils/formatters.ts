import { format, formatDistanceToNow, parseISO } from "date-fns";

/**
 * Format date to readable string
 */
export function formatDate(
  date: string | Date,
  formatString: string = "PPP"
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatString);
}

/**
 * Format date to time ago (e.g., "2 hours ago")
 */
export function formatTimeAgo(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format BOF session info (e.g., "Oct, 20 – Morning Session 1 – 10:00AM")
 */
export function formatBOFSessionInfo(
  sessionTime: string | Date,
  sessionNumber: number
): string {
  const dateObj =
    typeof sessionTime === "string" ? parseISO(sessionTime) : sessionTime;
  const dateStr = format(dateObj, "MMM, d");
  const timeStr = format(dateObj, "h:mmaaa");
  const sessionPeriod = sessionNumber === 1 ? "Morning" : "Evening";

  return `${dateStr} – ${sessionPeriod} Session ${sessionNumber} – ${timeStr}`;
}
