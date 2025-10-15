"use client";

import type { TopicDetails } from "@/lib/types";
import { ThumbsUp, Loader2 } from "lucide-react";

interface TopicCardProps {
	topic: TopicDetails;
	isVoted: boolean;
	onVote: (topicId: string) => Promise<void>;
	isVoting: boolean;
	disabled?: boolean;
	isOwnTopic?: boolean;
	votingTopicId?: string | null;
}

export function TopicCard({
	topic,
	isVoted,
	onVote,
	disabled,
	isOwnTopic,
	votingTopicId,
}: TopicCardProps) {
	const isThisTopicVoting = votingTopicId === topic.topic_id;

	const handleVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!disabled && !isOwnTopic) {
			await onVote(topic.topic_id);
		}
	};

	return (
		<div className="bg-white rounded-[16px] p-[16px] flex flex-col gap-[8px]">
			{/* Title */}
			<div className="w-full">
				<h3 className="font-medium text-[16px] leading-[22px] tracking-[-0.32px] text-zinc-950">
					{topic.title}
				</h3>
			</div>

			{/* Description */}
			{topic.description && (
				<div className="w-full overflow-clip">
					<p className="font-normal text-[14px] leading-[20px] text-[#17171c]">
						{topic.description}
					</p>
				</div>
			)}

			{/* Footer: Author + Vote Button */}
			<div className="flex items-end justify-between w-full">
				{/* Author */}
				<p className="font-normal text-[12px] leading-[20px] text-zinc-500 whitespace-pre">
					{isOwnTopic ? "Your Topic" : `Author: ${topic.author_name}`}
				</p>

				{/* Vote Button */}
				<button
					type="button"
					onClick={handleVote}
					disabled={disabled || isThisTopicVoting || isOwnTopic}
					className={`h-[40px] rounded-[6px] flex items-center gap-[4px] px-[12px] overflow-clip shrink-0 transition-all ${
						isVoted
							? "bg-[#ea4a35] hover:bg-[#ea4a35]/90"
							: isOwnTopic
								? "bg-white hover:bg-white/90"
								: "bg-white hover:bg-white/90 border border-gray-300"
					}`}
				>
					{isThisTopicVoting ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<>
							<ThumbsUp
								className={`h-4 w-4 ${isVoted ? "text-white fill-white" : "text-zinc-900"}`}
							/>
							{!isOwnTopic && (
								<span
									className={`font-medium text-[12px] leading-[16px] text-center whitespace-pre ${
										isVoted ? "text-white" : "text-zinc-900"
									}`}
								>
									{isVoted ? "Voted" : "Vote"}
								</span>
							)}
							<div
								className={`flex items-center justify-center px-[6px] py-[2px] rounded-[24px] ${
									isVoted ? "bg-[#d52c16]" : "bg-[#efeff1]"
								}`}
							>
								<span
									className={`font-medium text-[12px] leading-[16px] text-center whitespace-pre ${
										isVoted ? "text-white" : "text-zinc-900"
									}`}
								>
									{topic.vote_count}
								</span>
							</div>
						</>
					)}
				</button>
			</div>
		</div>
	);
}
