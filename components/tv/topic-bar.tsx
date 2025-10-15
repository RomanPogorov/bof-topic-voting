"use client";

import type { TopicDetails } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Trophy, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TopicBarProps {
	topic: TopicDetails;
	maxVotes: number;
	rank: number;
	isNew?: boolean;
}

export function TopicBar({ topic, maxVotes, rank, isNew }: TopicBarProps) {
	const [width, setWidth] = useState(0);
	const percentage = maxVotes > 0 ? (topic.vote_count / maxVotes) * 100 : 0;

	useEffect(() => {
		// Animate bar on mount
		const timer = setTimeout(() => setWidth(percentage), 100);
		return () => clearTimeout(timer);
	}, [percentage]);

	const isTop3 = rank <= 3;
	const barColor = isTop3
		? rank === 1
			? "bg-gradient-to-r from-yellow-500 to-yellow-400"
			: rank === 2
				? "bg-gradient-to-r from-gray-400 to-gray-300"
				: "bg-gradient-to-r from-orange-600 to-orange-500"
		: "bg-gradient-to-r from-blue-600 to-blue-500";

	return (
		<motion.div
			layoutId={`topic-${topic.topic_id}`}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{
				layout: { type: "spring", stiffness: 300, damping: 30 },
				opacity: { duration: 0.3 },
			}}
			className={cn(
				"group relative overflow-hidden rounded-xl bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-500",
				isNew && "animate-pulse",
				isTop3 && "ring-2 ring-yellow-500/30",
			)}
		>
			{/* Rank Badge */}
			<div className="absolute top-6 left-6 z-10">
				<div
					className={cn(
						"flex h-10 w-10 items-center justify-center rounded-full font-bold text-lg",
						isTop3
							? "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/50"
							: "bg-slate-700 text-slate-300",
					)}
				>
					{rank === 1 && <Trophy className="h-5 w-5" />}
					{rank !== 1 && rank}
				</div>
			</div>

			{/* Content */}
			<div className="relative pl-16">
				<div className="mb-3 flex items-start justify-between gap-4">
					<h3 className="text-xl font-semibold text-white line-clamp-2 leading-tight">
						{topic.title}
					</h3>
					{isNew && (
						<div className="flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
							<TrendingUp className="h-3 w-3" />
							NEW
						</div>
					)}
				</div>

				{/* Author */}
				<p className="mb-2 text-sm text-slate-400">
					by {topic.author_name || "Anonymous"}
					{topic.author_company && ` (${topic.author_company})`}
				</p>

				{/* Joined Users */}
				{topic.joined_users && topic.joined_users.length > 0 && (
					<div className="mb-3 flex flex-wrap gap-1.5">
						{topic.joined_users.map((user) => (
							<div
								key={user.id}
								className="px-2 py-0.5 bg-slate-700/50 rounded-full text-[11px] text-slate-300"
							>
								{user.name}
							</div>
						))}
					</div>
				)}

				{/* Vote Count & Bar */}
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-slate-400">Votes</span>
						<span className="text-2xl font-bold text-white">
							{topic.vote_count}
						</span>
					</div>

					{/* Animated Progress Bar */}
					<div className="relative h-3 overflow-hidden rounded-full bg-slate-700">
						<div
							className={cn(
								"absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
								barColor,
							)}
							style={{ width: `${width}%` }}
						>
							{/* Shimmer effect */}
							<div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
						</div>
					</div>

					<div className="text-right text-xs text-slate-500">
						{percentage.toFixed(1)}%
					</div>
				</div>
			</div>
		</motion.div>
	);
}
