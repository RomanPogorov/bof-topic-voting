"use client";

export const dynamic = "force-dynamic";

import { useAuth } from "@/lib/contexts/auth-context";
import { useAchievements } from "@/lib/hooks/useAchievements";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getInitials, formatDate } from "@/lib/utils/formatters";
import { LogOut, Trophy, FileText, ThumbsUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

export default function ProfilePage() {
	const { participant, logout } = useAuth();
	const { achievements, earnedAchievements, isLoading, totalPoints } =
		useAchievements(participant?.id);
	const [stats, setStats] = useState({
		topics_created: 0,
		votes_cast: 0,
		votes_received: 0,
	});

	useEffect(() => {
		async function fetchStats() {
			if (!participant) return;

			const { data } = await supabase
				.from("participant_stats")
				.select("*")
				.eq("id", participant.id)
				.single();

			if (data) {
				setStats({
					topics_created: data.topics_created || 0,
					votes_cast: data.votes_cast || 0,
					votes_received: data.votes_received || 0,
				});
			}
		}

		fetchStats();
	}, [participant]);

	if (!participant) {
		return (
			<div className="p-4 py-8">
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Please scan your QR code to view your profile
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (isLoading) {
		return <LoadingSpinner text="Loading profile..." className="py-20" />;
	}

	const earnedAchievementIds = new Set(
		earnedAchievements.map((ea) => ea.achievement_id),
	);

	return (
		<div className="p-4 space-y-6 pb-6 safe-top">
			{/* Header */}
			<div className="text-center pt-4">
				<h1 className="text-2xl font-bold">Profile</h1>
			</div>

			{/* User Info Card */}
			<Card>
				<CardContent className="p-6 space-y-6">
					<div className="flex flex-col items-center text-center space-y-3">
						<Avatar className="h-20 w-20">
							<AvatarFallback className="text-2xl bg-primary/10">
								{getInitials(participant.name)}
							</AvatarFallback>
						</Avatar>
						<div>
							<h2 className="text-xl font-bold">{participant.name}</h2>
							{participant.company && (
								<p className="text-muted-foreground">{participant.company}</p>
							)}
							<p className="text-sm text-muted-foreground mt-1">
								{participant.email}
							</p>
						</div>
					</div>

					{/* Stats Grid */}
					<div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
						<div className="text-center">
							<div className="flex items-center justify-center mb-1">
								<FileText className="h-4 w-4 text-muted-foreground" />
							</div>
							<p className="text-2xl font-bold">{stats.topics_created}</p>
							<p className="text-xs text-muted-foreground">Topics</p>
						</div>
						<div className="text-center">
							<div className="flex items-center justify-center mb-1">
								<ThumbsUp className="h-4 w-4 text-muted-foreground" />
							</div>
							<p className="text-2xl font-bold">{stats.votes_cast}</p>
							<p className="text-xs text-muted-foreground">Votes</p>
						</div>
						<div className="text-center">
							<div className="flex items-center justify-center mb-1">
								<Trophy className="h-4 w-4 text-muted-foreground" />
							</div>
							<p className="text-2xl font-bold">{totalPoints}</p>
							<p className="text-xs text-muted-foreground">Points</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Achievements */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-bold">Achievements</h2>
					<Badge variant="outline">
						{earnedAchievements.length}/{achievements.length}
					</Badge>
				</div>

				<div className="grid grid-cols-2 gap-3">
					{achievements.map((achievement) => {
						const earned = earnedAchievementIds.has(achievement.id);
						const earnedData = earnedAchievements.find(
							(ea) => ea.achievement_id === achievement.id,
						);

						return (
							<Card
								key={achievement.id}
								className={cn(
									"transition-all",
									earned
										? "bg-primary/5 border-primary/20"
										: "opacity-50 grayscale",
								)}
							>
								<CardContent className="p-4 text-center space-y-2">
									<div className="text-4xl">{achievement.icon}</div>
									<div>
										<h3 className="font-semibold text-sm leading-tight">
											{achievement.title}
										</h3>
										<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
											{achievement.description}
										</p>
									</div>
									<Badge
										variant={earned ? "default" : "outline"}
										className="text-xs"
									>
										{achievement.points} pts
									</Badge>
									{earned && earnedData && (
										<p className="text-xs text-muted-foreground">
											{formatDate(earnedData.earned_at, "PP")}
										</p>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>

			{/* Logout Button */}
			<Button
				variant="outline"
				className="w-full touch-target"
				onClick={logout}
			>
				<LogOut className="h-4 w-4 mr-2" />
				Logout
			</Button>
		</div>
	);
}
