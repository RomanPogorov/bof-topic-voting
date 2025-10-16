"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import type { TopicDetails, BOFSession } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { TopicBar } from "@/components/tv/topic-bar";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Calendar, Clock, TrendingUp, Users } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import { AnimatePresence } from "framer-motion";

export default function TVDisplayPage() {
	const params = useParams();
	const sessionId = params.sessionId as string;

	const [session, setSession] = useState<BOFSession | null>(null);
	const [topics, setTopics] = useState<TopicDetails[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
	const [isUpdating, setIsUpdating] = useState(false);
	const [hasRecentActivity, setHasRecentActivity] = useState(false);

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

	// Fetch topics with update indicator
	const fetchTopics = useCallback(
		async (showIndicator = false) => {
			try {
				if (showIndicator) setIsUpdating(true);

				const { data, error } = await supabase
					.from("topic_details")
					.select("*")
					.eq("bof_session_id", sessionId)
					.eq("is_hidden", false);

				// Sort by joined_users count
				const sortedData = (data || []).sort((a, b) => {
					const aJoined = a.joined_users?.length || 0;
					const bJoined = b.joined_users?.length || 0;
					return bJoined - aJoined;
				});

				if (error) throw error;
				setTopics(sortedData);
				setLastUpdate(new Date());
				setHasRecentActivity(true);
				// Reset activity flag after 2 minutes
				setTimeout(() => setHasRecentActivity(false), 120000);
			} catch (err) {
				console.error("Error fetching topics:", err);
			} finally {
				setIsLoading(false);
				if (showIndicator) {
					setTimeout(() => setIsUpdating(false), 1000);
				}
			}
		},
		[sessionId],
	);

	// Fetch topics
	useEffect(() => {
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
					fetchTopics(true); // Show update indicator
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
					fetchTopics(true); // Show update indicator
				},
			)
			.subscribe();

		// Adaptive refresh: more frequent when there's activity
		const refreshInterval = hasRecentActivity ? 3000 : 15000; // 3s if active, 15s if not
		const interval = setInterval(() => {
			fetchTopics(true);
		}, refreshInterval);

		return () => {
			supabase.removeChannel(channel);
			clearInterval(interval);
		};
	}, [sessionId, fetchTopics, hasRecentActivity]);

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
						{isUpdating && (
							<div className="ml-2 flex items-center gap-1">
								<div className="h-2 w-2 animate-spin rounded-full border border-white border-t-transparent" />
								<span className="text-xs text-white">Updating...</span>
							</div>
						)}
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
							{topics.reduce(
								(sum, t) => sum + (t.joined_users?.length || 0),
								0,
							)}{" "}
							total joined
						</span>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="space-y-4">
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-3xl font-bold text-white">All Topics</h2>
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
					<>
						<div className="mb-6 text-lg text-slate-300">
							<span className="font-semibold text-yellow-400">
								Top 5 topics
							</span>{" "}
							will be discussed
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
							<AnimatePresence>
								{topics.map((topic, index) => (
									<TopicBar
										key={topic.topic_id}
										topic={topic}
										rank={index + 1}
									/>
								))}
							</AnimatePresence>
						</div>
					</>
				)}
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
