"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Users, FileText, Vote, Trophy, TrendingUp } from "lucide-react";

interface DashboardStats {
	totalParticipants: number;
	totalTopics: number;
	totalVotes: number;
	totalAchievements: number;
	activeSessions: number;
}

export default function AdminDashboardPage() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchStats() {
			try {
				const [
					participantsRes,
					topicsRes,
					votesRes,
					achievementsRes,
					sessionsRes,
				] = await Promise.all([
					supabase
						.from("participants")
						.select("id", { count: "exact", head: true }),
					supabase.from("topics").select("id", { count: "exact", head: true }),
					supabase.from("votes").select("id", { count: "exact", head: true }),
					supabase
						.from("participant_achievements")
						.select("id", { count: "exact", head: true }),
					supabase
						.from("bof_sessions")
						.select("id", { count: "exact", head: true })
						.eq("status", "voting_open"),
				]);

				setStats({
					totalParticipants: participantsRes.count || 0,
					totalTopics: topicsRes.count || 0,
					totalVotes: votesRes.count || 0,
					totalAchievements: achievementsRes.count || 0,
					activeSessions: sessionsRes.count || 0,
				});
			} catch (err) {
				console.error("Error fetching stats:", err);
			} finally {
				setIsLoading(false);
			}
		}

		fetchStats();
	}, []);

	if (isLoading) {
		return <LoadingSpinner text="Loading dashboard..." className="py-20" />;
	}

	const statCards = [
		{
			title: "Total Participants",
			value: stats?.totalParticipants || 0,
			icon: Users,
			color: "text-blue-600",
			bgColor: "bg-blue-50",
		},
		{
			title: "Total Topics",
			value: stats?.totalTopics || 0,
			icon: FileText,
			color: "text-green-600",
			bgColor: "bg-green-50",
		},
		{
			title: "Total Votes",
			value: stats?.totalVotes || 0,
			icon: Vote,
			color: "text-purple-600",
			bgColor: "bg-purple-50",
		},
		{
			title: "Achievements Earned",
			value: stats?.totalAchievements || 0,
			icon: Trophy,
			color: "text-yellow-600",
			bgColor: "bg-yellow-50",
		},
		{
			title: "Active Sessions",
			value: stats?.activeSessions || 0,
			icon: TrendingUp,
			color: "text-orange-600",
			bgColor: "bg-orange-50",
		},
	];

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-4xl font-bold">Admin Dashboard</h1>
				<p className="text-muted-foreground mt-2">
					Overview of BOF Voting System
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{statCards.map((stat) => {
					const Icon = stat.icon;
					return (
						<Card key={stat.title}>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									{stat.title}
								</CardTitle>
								<div className={`rounded-full p-2 ${stat.bgColor}`}>
									<Icon className={`h-5 w-5 ${stat.color}`} />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold">{stat.value}</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						<a
							href="/admin/generate-qr"
							className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
						>
							<div className="rounded-full bg-blue-50 p-2">
								<Users className="h-5 w-5 text-blue-600" />
							</div>
							<div>
								<div className="font-medium">Generate QR Codes</div>
								<div className="text-sm text-muted-foreground">
									Create participant access codes
								</div>
							</div>
						</a>

						<a
							href="/admin/moderation"
							className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
						>
							<div className="rounded-full bg-orange-50 p-2">
								<FileText className="h-5 w-5 text-orange-600" />
							</div>
							<div>
								<div className="font-medium">Moderate Topics</div>
								<div className="text-sm text-muted-foreground">
									Review and manage submitted topics
								</div>
							</div>
						</a>

						<a
							href="/admin/participants"
							className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
						>
							<div className="rounded-full bg-green-50 p-2">
								<Users className="h-5 w-5 text-green-600" />
							</div>
							<div>
								<div className="font-medium">View Participants</div>
								<div className="text-sm text-muted-foreground">
									Manage participant accounts
								</div>
							</div>
						</a>

						<a
							href="/admin/analytics"
							className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
						>
							<div className="rounded-full bg-purple-50 p-2">
								<TrendingUp className="h-5 w-5 text-purple-600" />
							</div>
							<div>
								<div className="font-medium">View Analytics</div>
								<div className="text-sm text-muted-foreground">
									Detailed system analytics
								</div>
							</div>
						</a>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
