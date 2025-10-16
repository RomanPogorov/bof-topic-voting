"use client";

import type { TopicDetails } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Users } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TopicBarProps {
	topic: TopicDetails;
	rank: number;
	isNew?: boolean;
}

export function TopicBar({ topic, rank, isNew }: TopicBarProps) {
	const isTop5 = rank <= 5;
	const joinedCount = topic.joined_users?.length || 0;
	const [prevRank, setPrevRank] = useState(rank);
	const [isRankChanging, setIsRankChanging] = useState(false);

	// Detect rank change
	useEffect(() => {
		if (prevRank !== rank) {
			setIsRankChanging(true);
			const timer = setTimeout(() => {
				setIsRankChanging(false);
				setPrevRank(rank);
			}, 800);
			return () => clearTimeout(timer);
		}
	}, [rank, prevRank]);

	// Sort users: VIP first, then by name
	const sortedUsers = useMemo(() => {
		if (!topic.joined_users) return [];
		return [...topic.joined_users].sort((a, b) => {
			// VIP users first
			if (a.is_vip && !b.is_vip) return -1;
			if (!a.is_vip && b.is_vip) return 1;
			// Then alphabetically
			return a.name.localeCompare(b.name);
		});
	}, [topic.joined_users]);

	// Calculate visible users - approximately 3 rows with flex-wrap
	// Assuming average tag width ~140px and container width ~300px = ~2 tags per row
	// 3 rows = ~6 tags, leave space for "+X more"
	const maxVisibleUsers = 5;
	const visibleUsers = sortedUsers.slice(0, maxVisibleUsers);
	const remainingCount = Math.max(0, joinedCount - maxVisibleUsers);

	return (
		<motion.div
			layout
			layoutId={`topic-${topic.topic_id}`}
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.8 }}
			transition={{
				layout: {
					type: "spring",
					stiffness: 500,
					damping: 35,
					mass: 1,
				},
				opacity: { duration: 0.2 },
				scale: { duration: 0.2 },
			}}
			className={cn(
				"relative flex flex-col overflow-hidden rounded-xl backdrop-blur-sm",
				"w-full min-h-[280px] p-6",
				isNew && "animate-pulse",
				isRankChanging && "ring-4 ring-blue-400/50",
				isTop5
					? "bg-[rgba(2,3,4,0.1)] border border-[#d79a06]"
					: "bg-[#1d283a] border-2 border-[rgba(255,255,255,0.1)]",
			)}
		>
			{/* Header - Rank Badge + Joined Count */}
			<div className="flex items-center justify-between mb-8">
				{/* Rank Badge */}
				<motion.div
					key={rank}
					initial={{ scale: 1.2, rotate: 10 }}
					animate={{ scale: 1, rotate: 0 }}
					transition={{ type: "spring", stiffness: 500, damping: 25 }}
					className={cn(
						"flex h-12 w-12 items-center justify-center rounded-full font-bold text-xl shrink-0",
						isTop5
							? "bg-gradient-to-br from-yellow-500 to-yellow-600 text-[#131b2c]"
							: "bg-slate-700 text-slate-300",
					)}
				>
					{rank}
				</motion.div>

				{/* Joined Count Badge */}
				<div className="bg-[rgba(255,255,255,0.1)] flex items-center gap-1.5 px-3 py-2 rounded-full h-[48px]">
					<Users className="h-[22px] w-[22px] text-[rgba(255,255,255,0.9)]" />
					<span className="font-bold text-[26px] leading-[34px] text-[rgba(255,255,255,0.9)]">
						{joinedCount}
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="flex flex-col gap-6">
				{/* Author + Title Container */}
				<div className="h-[102px] relative">
					{/* Author */}
					<div className="absolute left-0 top-0 w-full">
						<p className="text-sm leading-5 text-slate-400">
							by {topic.author_name || "Anonymous"}
							{topic.author_company && ` (${topic.author_company})`}
						</p>
					</div>

					{/* Title */}
					<div className="absolute left-0 top-[28px] w-full">
						<h3 className="font-medium text-lg leading-6 text-white line-clamp-3 h-[72px] overflow-hidden">
							{topic.title}
						</h3>
					</div>
				</div>

				{/* Joined Users Tags - Fixed height container for 3 rows */}
				<div className="h-[88px] flex flex-wrap content-start gap-2 overflow-hidden">
					{visibleUsers.map((user) => (
						<div
							key={user.id}
							className="bg-[rgba(51,65,85,0.5)] px-3 py-1 rounded-full h-6 flex items-center"
						>
							<span className="text-xs leading-4 text-slate-300 whitespace-nowrap">
								{user.name}
							</span>
						</div>
					))}

					{remainingCount > 0 && (
						<div className="bg-[#aebacb] px-3 py-1 rounded-full h-6 flex items-center">
							<span className="text-xs leading-4 font-medium text-[#162030] whitespace-nowrap">
								+{remainingCount} more
							</span>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
}
