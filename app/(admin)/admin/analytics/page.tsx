"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
	BarChart3,
	TrendingUp,
	Users,
	FileText,
	Vote,
	Trophy,
	Activity,
} from "lucide-react";

interface AnalyticsData {
	totalParticipants: number;
	totalTopics: number;
	totalVotes: number;
	totalAchievements: number;
	topTopics: Array<{ title: string; votes: number }>;
	topParticipants: Array<{ name: string; points: number }>;
	sessionStats: Array<{ session: string; topics: number; votes: number }>;
	activityByDay: Array<{ day: number; participants: number }>;
}

export default function AnalyticsPage() {
	const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchAnalytics();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function fetchAnalytics() {
		try {
			setIsLoading(true);

			// Fetch basic stats
			const [participantsRes, topicsRes, votesRes, achievementsRes] =
				await Promise.all([
					supabase
						.from("participants")
						.select("id", { count: "exact", head: true }),
					supabase.from("topics").select("id", { count: "exact", head: true }),
					supabase.from("votes").select("id", { count: "exact", head: true }),
					supabase
						.from("participant_achievements")
						.select("id", { count: "exact", head: true }),
				]);

			// Fetch top topics
			const { data: topTopicsData } = await supabase
				.from("topic_details")
				.select("title, vote_count")
				.order("vote_count", { ascending: false })
				.limit(5);

			// Fetch top participants
			const { data: topParticipantsData } = await supabase
				.from("participant_stats")
				.select("name, total_points")
				.order("total_points", { ascending: false })
				.limit(5);

			// Fetch session stats
			const { data: sessionsData } = await supabase
				.from("bof_sessions")
				.select("id, title, day_number, session_number");

			const sessionStats = await Promise.all(
				(sessionsData || []).map(async (session) => {
					const [topicsRes, votesRes] = await Promise.all([
						supabase
							.from("topics")
							.select("id", { count: "exact", head: true })
							.eq("bof_session_id", session.id),
						supabase
							.from("votes")
							.select("id", { count: "exact", head: true })
							.in(
								"topic_id",
								(
									await supabase
										.from("topics")
										.select("id")
										.eq("bof_session_id", session.id)
								).data?.map((t) => t.id) || [],
							),
					]);

					return {
						session: `Day ${session.day_number} - ${session.title}`,
						topics: topicsRes.count || 0,
						votes: votesRes.count || 0,
					};
				}),
			);

			// Activity by day (simplified)
			const activityByDay = [
				{
					day: 1,
					participants: Math.floor((participantsRes.count || 0) * 0.3),
				},
				{
					day: 2,
					participants: Math.floor((participantsRes.count || 0) * 0.5),
				},
				{
					day: 3,
					participants: Math.floor((participantsRes.count || 0) * 0.2),
				},
			];

			setAnalytics({
				totalParticipants: participantsRes.count || 0,
				totalTopics: topicsRes.count || 0,
				totalVotes: votesRes.count || 0,
				totalAchievements: achievementsRes.count || 0,
				topTopics:
					topTopicsData?.map((t) => ({
						title: t.title,
						votes: t.vote_count,
					})) || [],
				topParticipants:
					topParticipantsData?.map((p) => ({
						name: p.name,
						points: p.total_points,
					})) || [],
				sessionStats,
				activityByDay,
			});
		} catch (err) {
			console.error("Error fetching analytics:", err);
		} finally {
			setIsLoading(false);
		}
	}

	if (isLoading) {
		return <LoadingSpinner text="Loading analytics..." className="py-20" />;
	}

	if (!analytics) {
		return (
			<div className="text-center py-20 text-muted-foreground">
				Failed to load analytics
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-4xl font-bold">Analytics</h1>
				<p className="text-muted-foreground mt-2">
					Detailed system analytics and insights
				</p>
			</div>

			{/* Overview Stats */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Participants
						</CardTitle>
						<Users className="h-5 w-5 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{analytics.totalParticipants}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Total registered users
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Topics
						</CardTitle>
						<FileText className="h-5 w-5 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{analytics.totalTopics}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Topics submitted
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Votes
						</CardTitle>
						<Vote className="h-5 w-5 text-purple-600" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{analytics.totalVotes}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Total votes cast
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Achievements
						</CardTitle>
						<Trophy className="h-5 w-5 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{analytics.totalAchievements}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Achievements earned
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{/* Top Topics */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BarChart3 className="h-5 w-5" />
							Top Topics
						</CardTitle>
					</CardHeader>
					<CardContent>
						{analytics.topTopics.length === 0 ? (
							<p className="text-center text-muted-foreground py-8">
								No topics yet
							</p>
						) : (
							<div className="space-y-4">
								{analytics.topTopics.map((topic) => (
									<div key={topic.title} className="space-y-1">
										<div className="flex items-center justify-between text-sm">
											<span className="font-medium truncate">
												{topic.title}
											</span>
											<span className="text-muted-foreground">
												{topic.votes} votes
											</span>
										</div>
										<div className="h-2 bg-muted rounded-full overflow-hidden">
											<div
												className="h-full bg-primary rounded-full"
												style={{
													width: `${(topic.votes / Math.max(...analytics.topTopics.map((t) => t.votes), 1)) * 100}%`,
												}}
											/>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Top Participants */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5" />
							Top Participants
						</CardTitle>
					</CardHeader>
					<CardContent>
						{analytics.topParticipants.length === 0 ? (
							<p className="text-center text-muted-foreground py-8">
								No participants yet
							</p>
						) : (
							<div className="space-y-3">
								{analytics.topParticipants.map((participant) => (
									<div
										key={participant.name}
										className="flex items-center justify-between p-3 rounded-lg bg-muted"
									>
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
												{analytics.topParticipants.indexOf(participant) + 1}
											</div>
											<span className="font-medium">{participant.name}</span>
										</div>
										<div className="flex items-center gap-1 text-yellow-600 font-bold">
											<Trophy className="h-4 w-4" />
											{participant.points}
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Session Stats */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Activity className="h-5 w-5" />
							Session Activity
						</CardTitle>
					</CardHeader>
					<CardContent>
						{analytics.sessionStats.length === 0 ? (
							<p className="text-center text-muted-foreground py-8">
								No sessions yet
							</p>
						) : (
							<div className="space-y-3">
								{analytics.sessionStats.map((session) => (
									<div
										key={session.session}
										className="flex items-center justify-between p-3 rounded-lg border"
									>
										<div className="flex-1 min-w-0">
											<div className="font-medium truncate">
												{session.session}
											</div>
										</div>
										<div className="flex gap-4 text-sm">
											<div className="text-center">
												<div className="font-bold">{session.topics}</div>
												<div className="text-xs text-muted-foreground">
													topics
												</div>
											</div>
											<div className="text-center">
												<div className="font-bold">{session.votes}</div>
												<div className="text-xs text-muted-foreground">
													votes
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Activity by Day */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Participation by Day
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{analytics.activityByDay.map((day) => (
								<div key={day.day} className="space-y-1">
									<div className="flex items-center justify-between text-sm">
										<span className="font-medium">Day {day.day}</span>
										<span className="text-muted-foreground">
											{day.participants} participants
										</span>
									</div>
									<div className="h-3 bg-muted rounded-full overflow-hidden">
										<div
											className="h-full bg-blue-600 rounded-full"
											style={{
												width: `${(day.participants / analytics.totalParticipants) * 100}%`,
											}}
										/>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
