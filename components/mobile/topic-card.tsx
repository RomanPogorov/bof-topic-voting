"use client";

import type { TopicDetails } from "@/lib/types";
import { Loader2, Users } from "lucide-react";

interface TopicCardProps {
	topic: TopicDetails;
	isJoined: boolean;
	onJoin: (topicId: string) => Promise<void>;
	isJoining: boolean;
	disabled?: boolean;
	isOwnTopic?: boolean;
	joiningTopicId?: string | null;
	onEdit?: (topicId: string) => void;
	onDelete?: (topicId: string) => void;
}

export function TopicCard({
	topic,
	isJoined,
	onJoin,
	disabled,
	isOwnTopic,
	joiningTopicId,
	onEdit,
	onDelete,
}: TopicCardProps) {
	const isThisTopicJoining = joiningTopicId === topic.topic_id;

	const handleJoin = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!disabled && !isOwnTopic) {
			await onJoin(topic.topic_id);
		}
	};

	const joinedUsers = topic.joined_users || [];
	const cannotJoin = disabled && !isOwnTopic;

	return (
		<div className="bg-white rounded-[16px] p-[16px] flex flex-col gap-[12px]">
			{/* Header: Title + Edit/Delete buttons */}
			<div className="flex items-start justify-between gap-2">
				<div className="flex-1">
					<h3 className="font-medium text-[16px] leading-[22px] tracking-[-0.32px] text-zinc-950">
						{topic.title}
					</h3>
				</div>
				{isOwnTopic && onEdit && onDelete && (
					<div className="flex gap-1">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onEdit(topic.topic_id);
							}}
							className="px-2 py-1 text-[12px] text-blue-600 hover:bg-blue-50 rounded"
						>
							Edit
						</button>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(topic.topic_id);
							}}
							className="px-2 py-1 text-[12px] text-red-600 hover:bg-red-50 rounded"
						>
							Delete
						</button>
					</div>
				)}
			</div>

			{/* Description */}
			{topic.description && (
				<div className="w-full overflow-clip">
					<p className="font-normal text-[14px] leading-[20px] text-[#17171c]">
						{topic.description}
					</p>
				</div>
			)}

			{/* Author */}
			<p className="font-normal text-[12px] leading-[18px] text-zinc-500">
				by {topic.author_name}
				{topic.author_company && ` (${topic.author_company})`}
			</p>

			{/* Joined users */}
			{joinedUsers.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{joinedUsers.map((user) => (
						<div
							key={user.id}
							className="px-2 py-1 bg-[#f5f5f6] rounded-full text-[11px] text-zinc-600"
						>
							{user.name}
						</div>
					))}
				</div>
			)}

			{/* Footer: Join Button */}
			<div className="flex flex-col gap-2 w-full">
				{cannotJoin && !isOwnTopic && (
					<p className="text-[11px] text-zinc-500 text-center">
						You're leading your own topic
					</p>
				)}
				<div className="flex items-center justify-end w-full">
					<button
						type="button"
						onClick={handleJoin}
						disabled={disabled || isThisTopicJoining || isOwnTopic}
						className={`h-[40px] rounded-[6px] flex items-center gap-[4px] px-[12px] overflow-clip shrink-0 transition-all ${
							isOwnTopic
								? "bg-blue-500 hover:bg-blue-500/90"
								: isJoined
									? "bg-[#ea4a35] hover:bg-[#ea4a35]/90"
									: disabled
										? "bg-gray-200 border border-gray-300 cursor-not-allowed"
										: "bg-white hover:bg-white/90 border border-gray-300"
						}`}
					>
						{isThisTopicJoining ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<>
								<Users
									className={`h-4 w-4 ${isOwnTopic || isJoined ? "text-white" : disabled ? "text-gray-400" : "text-zinc-900"}`}
								/>
								<span
									className={`font-medium text-[12px] leading-[16px] text-center whitespace-pre ${
										isOwnTopic || isJoined
											? "text-white"
											: disabled
												? "text-gray-400"
												: "text-zinc-900"
									}`}
								>
									{isOwnTopic ? "Lead" : isJoined ? "Joined" : "Join"}
								</span>
								<div
									className={`flex items-center justify-center px-[6px] py-[2px] rounded-[24px] ${
										isOwnTopic
											? "bg-blue-600"
											: isJoined
												? "bg-[#d52c16]"
												: disabled
													? "bg-gray-300"
													: "bg-[#efeff1]"
									}`}
								>
									<span
										className={`font-medium text-[12px] leading-[16px] text-center whitespace-pre ${
											isOwnTopic || isJoined
												? "text-white"
												: disabled
													? "text-gray-500"
													: "text-zinc-900"
										}`}
									>
										{topic.vote_count || 0}
									</span>
								</div>
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
