"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { TopicDetails, ParticipantStats, BOFSession } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { TopicBar } from "@/components/tv/topic-bar";
import { LeaderboardCard } from "@/components/tv/leaderboard-card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Calendar, Clock, TrendingUp, Users } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

export default function TVDisplayPage() {
	const params = useParams();
	const sessionId = params.sessionId as string;

	const [session, setSession] = useState<BOFSession | null>(null);
	const [topics, setTopics] = useState<TopicDetails[]>([]);
	const [leaderboard, setLeaderboard] = useState<ParticipantStats[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

	// Fetch session details
	useEffect(() => {
		async function fetchSession() {
			const { data } = await supabase
				.from("bof_sessions")
				.select("*")
				.eq("id", sessionId)
				.single();

			if (data) setSession(data);
		}

		fetchSession();
	}, [sessionId]);

	// Fetch topics
	useEffect(() => {
		async function fetchTopics() {
			try {
				const { data, error } = await supabase
					.from("topic_details")
					.select("*")
					.eq("bof_session_id", sessionId)
					.eq("is_hidden", false)
					.order("vote_count", { ascending: false })
					.limit(10);

				if (error) throw error;
				setTopics(data || []);
				setLastUpdate(new Date());
			} catch (err) {
				console.error("Error fetching topics:", err);
			} finally {
				setIsLoading(false);
			}
		}

		fetchTopics();

		// Subscribe to real-time updates
		const channel = supabase
			.channel(`tv-session-${sessionId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "votes",
				},
				() => {
					fetchTopics();
				},
			)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "topics",
				},
				() => {
					fetchTopics();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [sessionId]);

	// Fetch leaderboard
	useEffect(() => {
		async function fetchLeaderboard() {
			try {
				const { data, error } = await supabase
					.from("participant_stats")
					.select("*")
					.order("total_points", { ascending: false })
					.limit(5);

				if (error) throw error;
				setLeaderboard(data || []);
			} catch (err) {
				console.error("Error fetching leaderboard:", err);
			}
		}

		fetchLeaderboard();

		// Subscribe to real-time leaderboard updates
		const channel = supabase
			.channel("tv-leaderboard")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "participant_achievements",
				},
				() => {
					fetchLeaderboard();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<LoadingSpinner text="Loading TV Display..." className="text-white" />
			</div>
		);
	}

	if (!session) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="text-4xl font-bold text-white">Session not found</h1>
				</div>
			</div>
		);
	}

	const maxVotes = Math.max(...topics.map((t) => t.vote_count), 1);

	return (
		<div className="min-h-screen p-8">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-start justify-between">
					<div>
						<div className="mb-2 flex items-center gap-3">
							<div className="rounded-full bg-blue-500 px-4 py-1 text-sm font-medium text-white">
								Day {session.day_number} · Session {session.session_number}
							</div>
							<div
								className={cn(
									"rounded-full px-4 py-1 text-sm font-medium",
									session.status === "voting_open" &&
										"bg-green-500/20 text-green-400",
									session.status === "upcoming" &&
										"bg-yellow-500/20 text-yellow-400",
									session.status === "voting_closed" &&
										"bg-orange-500/20 text-orange-400",
									session.status === "completed" &&
										"bg-gray-500/20 text-gray-400",
								)}
							>
								{session.status === "voting_open" && "🗳️ Voting Open"}
								{session.status === "upcoming" && "⏳ Upcoming"}
								{session.status === "voting_closed" && "🔒 Voting Closed"}
								{session.status === "completed" && "✓ Completed"}
							</div>
						</div>
						<h1 className="text-5xl font-bold text-white mb-3">
							{session.title}
						</h1>
						{session.description && (
							<p className="text-xl text-slate-300 max-w-3xl">
								{session.description}
							</p>
						)}
					</div>

					{/* Live indicator */}
					<div className="flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2">
						<div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
						<span className="text-sm font-medium text-red-400">LIVE</span>
					</div>
				</div>

				{/* Session Info */}
				<div className="mt-6 flex items-center gap-8 text-slate-300">
					<div className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						<span>{formatDate(session.session_time, "PPP")}</span>
					</div>
					<div className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						<span>{formatDate(session.session_time, "p")}</span>
					</div>
					<div className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						<span>{topics.length} topics</span>
					</div>
					<div className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						<span>
							{topics.reduce((sum, t) => sum + t.vote_count, 0)} total votes
						</span>
					</div>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-3 gap-8">
				{/* Topics - 2 columns */}
				<div className="col-span-2 space-y-4">
					<div className="mb-6 flex items-center justify-between">
						<h2 className="text-3xl font-bold text-white">Top Topics</h2>
						<div className="text-sm text-slate-400">
							Updated {lastUpdate.toLocaleTimeString()}
						</div>
					</div>

					{topics.length === 0 ? (
						<div className="rounded-xl bg-slate-800/50 p-12 text-center backdrop-blur-sm">
							<p className="text-xl text-slate-400">
								No topics yet. Be the first to submit!
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{topics.map((topic, index) => (
								<TopicBar
									key={topic.topic_id}
									topic={topic}
									maxVotes={maxVotes}
									rank={index + 1}
								/>
							))}
						</div>
					)}
				</div>

				{/* Leaderboard - 1 column */}
				<div className="space-y-4">
					<h2 className="text-3xl font-bold text-white mb-6">🏆 Leaderboard</h2>

					{leaderboard.length === 0 ? (
						<div className="rounded-xl bg-slate-800/50 p-8 text-center backdrop-blur-sm">
							<p className="text-slate-400">No participants yet</p>
						</div>
					) : (
						<div className="space-y-3">
							{leaderboard.map((participant, index) => (
								<LeaderboardCard
									key={participant.participant_id}
									participant={participant}
									rank={index + 1}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Footer */}
			<div className="mt-12 border-t border-slate-700 pt-6 text-center">
				<p className="text-slate-500">
					Birds of a Feather Voting System · Conference 2025
				</p>
			</div>
		</div>
	);
}
