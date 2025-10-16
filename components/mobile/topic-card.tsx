"use client";

import type { TopicDetails } from "@/lib/types";
import { Loader2, Users, Pencil, Trash2, Check } from "lucide-react";

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
	currentUserId?: string;
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
	currentUserId,
}: TopicCardProps) {
	const isThisTopicJoining = joiningTopicId === topic.topic_id;

	const handleJoin = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!disabled && !isOwnTopic) {
			await onJoin(topic.topic_id);
		}
	};

	const joinedUsers = topic.joined_users || [];
	const otherJoinedUsers = joinedUsers.filter(
		(user) => user.id !== currentUserId,
	);
	const currentUserJoined = joinedUsers.some(
		(user) => user.id === currentUserId,
	);

	// Lead карточка (твой топик)
	if (isOwnTopic) {
		return (
			<div className="bg-white border-2 border-[#2378e1] rounded-[16px] p-[16px] flex flex-col gap-[12px]">
				{/* Бейдж Lead + участники + кнопки Edit/Delete */}
				<div className="flex items-center gap-[12px]">
					<div className="bg-[#2378e1] px-[10px] py-[4px] rounded-full h-[25px] inline-flex items-center">
						<span className="font-normal text-[13px] leading-[16.5px] text-white">
							Lead
						</span>
					</div>
					<div className="flex-1" />
					<div className="bg-white flex gap-[4px] items-center px-[8px] py-[4px] rounded-[9999px]">
						<Users className="size-[16px] text-[#17171c]" />
						<span className="font-medium text-[12px] leading-[16px] text-[#17171c]">
							{joinedUsers.length}
						</span>
					</div>
					{onEdit && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onEdit(topic.topic_id);
							}}
							className="bg-[#f5f5f6] flex items-center justify-center rounded-full size-[44px] hover:bg-[#e4e4e7] transition-colors"
						>
							<Pencil className="size-[16px] text-zinc-950" />
						</button>
					)}
					{onDelete && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(topic.topic_id);
							}}
							className="bg-[#f6f5f5] flex items-center justify-center rounded-full size-[44px] hover:bg-[#e4e4e7] transition-colors"
						>
							<Trash2 className="size-[16px] text-zinc-950" />
						</button>
					)}
				</div>

				{/* Заголовок */}
				<div className="flex flex-col gap-[8px]">
					<h3 className="font-medium text-[16px] leading-[22px] tracking-[-0.32px] text-zinc-950">
						{topic.title}
					</h3>
				</div>

				{/* Описание */}
				{topic.description && (
					<div className="w-full">
						<p className="font-normal text-[14px] leading-[20px] text-[#17171c]">
							{topic.description}
						</p>
					</div>
				)}

				{/* Серая линия (только если есть joined пользователи) */}
				{joinedUsers.length > 0 && (
					<div className="w-full h-[1px] bg-zinc-200" />
				)}

				{/* Теги joined пользователей */}
				{joinedUsers.length > 0 && (
					<div className="flex flex-wrap gap-[8px]">
						{joinedUsers.map((user) => (
							<div
								key={user.id}
								className="bg-[#f5f5f6] px-[8px] py-[4px] rounded-full h-[25px] inline-flex items-center"
							>
								<span className="font-normal text-[13px] leading-[16.5px] text-[#52525b]">
									{user.name}
								</span>
							</div>
						))}
					</div>
				)}
			</div>
		);
	}

	// Обычные карточки (когда ты Lead другого топика)
	return (
		<div
			className={`bg-white rounded-[16px] p-[16px] flex flex-col gap-[12px] ${
				isJoined ? "border-2 border-[#ea4a35]" : ""
			}`}
		>
			{/* Автор + участники */}
			<div className="flex items-start justify-between">
				<span className="font-normal text-[13px] leading-[18px] text-zinc-500">
					Author: {topic.author_name}
				</span>
				<div className="bg-white flex gap-[4px] items-center px-[8px] py-[4px] rounded-[9999px] border border-zinc-200">
					<Users className="size-[16px] text-[#17171c]" />
					<span className="font-medium text-[12px] leading-[16px] text-[#17171c]">
						{joinedUsers.length}
					</span>
				</div>
			</div>

			{/* Заголовок */}
			<div className="flex flex-col gap-[8px]">
				<h3 className="font-medium text-[16px] leading-[22px] tracking-[-0.32px] text-zinc-950">
					{topic.title}
				</h3>
			</div>

			{/* Описание */}
			{topic.description && (
				<div className="w-full">
					<p className="font-normal text-[14px] leading-[20px] text-[#17171c]">
						{topic.description}
					</p>
				</div>
			)}

			{/* Серая линия (только если есть joined пользователи) */}
			{joinedUsers.length > 0 && <div className="w-full h-[1px] bg-zinc-200" />}

			{/* Теги joined пользователей */}
			{joinedUsers.length > 0 && (
				<div className="flex flex-wrap gap-[8px]">
					{otherJoinedUsers.map((user) => (
						<div
							key={user.id}
							className="bg-[#f5f5f6] px-[8px] py-[4px] rounded-full h-[25px] inline-flex items-center"
						>
							<span className="font-normal text-[13px] leading-[16.5px] text-[#52525b]">
								{user.name}
							</span>
						</div>
					))}
					{currentUserJoined && (
						<div className="bg-[#ea4a35] px-[8px] py-[4px] rounded-full h-[25px] inline-flex items-center">
							<span className="font-normal text-[13px] leading-[16.5px] text-white">
								You
							</span>
						</div>
					)}
				</div>
			)}

			{/* Кнопка Join/Joined */}
			{isJoined ? (
				<div className="h-[40px] w-full rounded-[6px] flex items-center justify-center gap-[4px] bg-[rgba(234,74,53,0.1)]">
					<Users className="size-[16px] text-[#ea4a35]" />
					<span className="font-semibold text-[12px] leading-[16px] text-[#ea4a35]">
						You Joined
					</span>
					<Check className="size-[16px] text-[#ea4a35]" />
				</div>
			) : (
				<button
					type="button"
					onClick={handleJoin}
					disabled={disabled || isThisTopicJoining}
					className={`h-[40px] w-full rounded-[6px] flex items-center justify-center gap-[4px] transition-all ${
						disabled
							? "bg-[#f5f5f6] cursor-not-allowed"
							: "bg-[#ea4a35] hover:bg-[#ea4a35]/90"
					}`}
				>
					{isThisTopicJoining ? (
						<Loader2 className="size-[16px] animate-spin text-white" />
					) : (
						<>
							<Users
								className={`size-[16px] ${disabled ? "text-[#9c9ca2]" : "text-white"}`}
							/>
							<span
								className={`font-medium text-[12px] leading-[16px] ${disabled ? "text-[#9c9ca2]" : "text-white"}`}
							>
								Join
							</span>
						</>
					)}
				</button>
			)}
		</div>
	);
}
