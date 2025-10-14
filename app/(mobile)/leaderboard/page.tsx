"use client";

export const dynamic = "force-dynamic";

import { useAuth } from "@/lib/contexts/auth-context";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal } from "lucide-react";
import { getInitials } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

export default function LeaderboardPage() {
	const { participant } = useAuth();
	const { participants, isLoading, error } = useLeaderboard();

	if (isLoading) {
		return <LoadingSpinner text="Loading leaderboard..." className="py-20" />;
	}

	if (error) {
		return (
			<div className="p-4">
				<ErrorMessage error={error} />
			</div>
		);
	}

	const currentUserStats = participant
		? participants.find((p) => p.id === participant.id)
		: null;

	const top3 = participants.slice(0, 3);
	const rest = participants.slice(3);

	return (
		<div className="space-y-6 pb-6 safe-top">
			{/* Header */}
			<div className="text-center py-8 bg-gradient-to-b from-yellow-100 to-background">
				<Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
				<h1 className="text-3xl font-bold">Leaderboard</h1>
				<p className="text-sm text-muted-foreground mt-2">
					Top contributors ranked by points
				</p>
			</div>

			<div className="px-4 space-y-6">
				{/* Current User Position */}
				{currentUserStats && currentUserStats.rank! > 3 && (
					<Card className="border-2 border-primary">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<div className="text-xl font-bold text-primary w-8 flex-shrink-0">
										#{currentUserStats.rank}
									</div>
									<Avatar className="h-10 w-10 flex-shrink-0">
										<AvatarFallback className="bg-primary/10">
											{getInitials(currentUserStats.name)}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0 flex-1">
										<p className="font-semibold truncate">Your Position</p>
										<p className="text-sm text-muted-foreground">
											{currentUserStats.total_points} points
										</p>
									</div>
								</div>
								<Badge>{currentUserStats.achievements_count} 🏆</Badge>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Top 3 Podium */}
				<div className="grid grid-cols-3 gap-2">
					{[1, 0, 2].map((index) => {
						const p = top3[index];
						if (!p) return null;

						const isFirst = index === 0;
						const isSecond = index === 1;
						const isThird = index === 2;

						return (
							<Card
								key={p.id}
								className={cn(
									"transition-all",
									isFirst && "bg-yellow-50 border-yellow-500",
									isSecond && "bg-slate-50 border-slate-400",
									isThird && "bg-orange-50 border-orange-600",
									participant?.id === p.id && "ring-2 ring-primary",
								)}
							>
								<CardContent
									className={cn("p-4 text-center space-y-2", isFirst && "pt-2")}
								>
									<div className="text-4xl">
										{isFirst && "🥇"}
										{isSecond && "🥈"}
										{isThird && "🥉"}
									</div>
									<Avatar className="h-12 w-12 mx-auto">
										<AvatarFallback
											className={cn(
												"text-sm",
												isFirst && "bg-yellow-100",
												isSecond && "bg-slate-100",
												isThird && "bg-orange-100",
											)}
										>
											{getInitials(p.name)}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-semibold text-sm truncate">{p.name}</p>
										<p className="text-xs text-muted-foreground">
											{p.total_points} pts
										</p>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Rest of the list */}
				{rest.length > 0 && (
					<div className="space-y-2">
						<h2 className="text-lg font-semibold px-1">All Rankings</h2>
						{rest.map((p) => (
							<Card
								key={p.id}
								className={cn(
									"transition-all",
									participant?.id === p.id && "ring-2 ring-primary",
								)}
							>
								<CardContent className="p-4">
									<div className="flex items-center justify-between gap-3">
										<div className="flex items-center gap-3 flex-1 min-w-0">
											<div className="text-lg font-semibold text-muted-foreground w-8 flex-shrink-0 text-center">
												#{p.rank}
											</div>
											<Avatar className="h-10 w-10 flex-shrink-0">
												<AvatarFallback className="text-sm bg-primary/10">
													{getInitials(p.name)}
												</AvatarFallback>
											</Avatar>
											<div className="min-w-0 flex-1">
												<p className="font-semibold truncate">{p.name}</p>
												<div className="flex items-center gap-2 text-xs text-muted-foreground">
													<span>{p.topics_created} topics</span>
													<span>·</span>
													<span>{p.votes_cast} votes</span>
												</div>
											</div>
										</div>
										<div className="text-right flex-shrink-0">
											<p className="font-bold">{p.total_points}</p>
											<p className="text-xs text-muted-foreground">points</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
