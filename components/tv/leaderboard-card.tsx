"use client";

import type { ParticipantStats } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Award, Crown, Medal, Sparkles } from "lucide-react";

interface LeaderboardCardProps {
	participant: ParticipantStats;
	rank: number;
}

function getRankIcon(rank: number) {
	switch (rank) {
		case 1:
			return <Crown className="h-6 w-6 text-yellow-400" />;
		case 2:
			return <Medal className="h-6 w-6 text-gray-400" />;
		case 3:
			return <Medal className="h-6 w-6 text-orange-600" />;
		default:
			return <Award className="h-5 w-5 text-slate-400" />;
	}
}

export function LeaderboardCard({ participant, rank }: LeaderboardCardProps) {
	const isTop3 = rank <= 3;

	return (
		<div
			className={cn(
				"group relative overflow-hidden rounded-xl bg-slate-800/50 p-5 backdrop-blur-sm transition-all duration-300",
				isTop3 && "ring-2",
				rank === 1 &&
					"ring-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-transparent",
				rank === 2 &&
					"ring-gray-400/50 bg-gradient-to-r from-gray-400/10 to-transparent",
				rank === 3 &&
					"ring-orange-600/50 bg-gradient-to-r from-orange-600/10 to-transparent",
			)}
		>
			<div className="flex items-center gap-4">
				{/* Rank */}
				<div className="flex-shrink-0">
					<div
						className={cn(
							"flex h-12 w-12 items-center justify-center rounded-full font-bold text-lg",
							isTop3
								? "bg-gradient-to-br shadow-lg"
								: "bg-slate-700 text-slate-300",
							rank === 1 &&
								"from-yellow-500 to-yellow-600 text-white shadow-yellow-500/50",
							rank === 2 &&
								"from-gray-400 to-gray-500 text-white shadow-gray-400/50",
							rank === 3 &&
								"from-orange-600 to-orange-700 text-white shadow-orange-600/50",
						)}
					>
						{getRankIcon(rank)}
					</div>
				</div>

				{/* Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<h3 className="text-lg font-semibold text-white truncate">
							{participant.name}
						</h3>
						{rank === 1 && (
							<Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
						)}
					</div>
					{participant.company && (
						<p className="text-sm text-slate-400 truncate">
							{participant.company}
						</p>
					)}
				</div>

				{/* Stats */}
				<div className="flex-shrink-0 text-right">
					<div className="text-3xl font-bold text-white">
						{participant.total_points}
					</div>
					<div className="text-xs text-slate-400">points</div>
				</div>
			</div>

			{/* Stats Bar */}
			<div className="mt-4 flex gap-4 text-xs text-slate-400">
				<div className="flex items-center gap-1">
					<span>🗳️</span>
					<span>{participant.votes_cast} votes</span>
				</div>
				<div className="flex items-center gap-1">
					<span>💡</span>
					<span>{participant.topics_created} topics</span>
				</div>
				<div className="flex items-center gap-1">
					<span>🏆</span>
					<span>{participant.achievements_count} achievements</span>
				</div>
			</div>
		</div>
	);
}
