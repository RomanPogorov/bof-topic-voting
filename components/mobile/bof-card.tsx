"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { BOFSession, TopicDetails } from "@/lib/types";
import { formatDate } from "@/lib/utils/formatters";
import { TopicsService } from "@/lib/services/topics.service";
import { useAuth } from "@/lib/contexts/auth-context";
import { Clock, Users } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";

interface BOFCardProps {
	session: BOFSession;
}

function SimpleTopicRow({
	topic,
	participantId,
}: {
	topic: TopicDetails;
	participantId: string;
}) {
	const isOwnTopic = topic.author_id === participantId;
	const hasJoined =
		Array.isArray(topic.joined_users) &&
		topic.joined_users.some((v) => v.id === participantId);

	return (
		<div className="flex items-center gap-[8px] bg-[#f5f5f6] rounded-[6px] p-[8px]">
			<div className="flex-1 min-w-0 flex flex-col gap-[4px]">
				<div className="w-full">
					<p className="text-[12px] leading-[16px] text-[#909098]">
						{topic.author_name}
					</p>
				</div>
				<div className="overflow-hidden w-full">
					<p className="text-[15px] leading-[16px] text-zinc-950 overflow-hidden text-ellipsis tracking-[-0.45px] whitespace-nowrap">
						{topic.title}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-[4px] shrink-0">
				{isOwnTopic ? (
					<div className="bg-[#2378e1] flex gap-[4px] items-center px-[8px] py-[4px] rounded-[9999px]">
						<span className="font-medium text-[12px] leading-[18px] text-white">
							Lead
						</span>
						<Users className="size-[16px] text-white" />
						<span className="font-medium text-[12px] leading-[16px] text-white">
							{topic.vote_count || 0}
						</span>
					</div>
				) : hasJoined ? (
					<div className="bg-[#ea4a35] flex gap-[4px] items-center px-[8px] py-[4px] rounded-[6px]">
						<span className="font-medium text-[12px] leading-[18px] text-white">
							Joined
						</span>
						<Users className="size-[16px] text-white" />
						<span className="font-medium text-[12px] leading-[16px] text-white">
							{topic.vote_count || 0}
						</span>
					</div>
				) : (
					<div className="bg-white flex gap-[4px] items-center px-[8px] py-[4px] rounded-[9999px]">
						<Users className="size-[16px] text-[#17171c]" />
						<span className="font-medium text-[12px] leading-[16px] text-[#17171c]">
							{topic.vote_count || 0}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}

export function BOFCard({ session }: BOFCardProps) {
	const { participant } = useAuth();
	const [topics, setTopics] = useState<TopicDetails[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchTopics() {
			setIsLoading(true);
			try {
				const topicsData = await TopicsService.getTopics(session.id);
				const sortedTopics = topicsData.sort((a, b) => {
					if (b.vote_count !== a.vote_count) {
						return b.vote_count - a.vote_count;
					}
					return (
						new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
					);
				});
				setTopics(sortedTopics);
			} catch (error) {
				console.error("Error fetching topics:", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchTopics();
	}, [session.id]);

	return (
		<Link href={ROUTES.BOF(session.id)}>
			<div className="bg-white rounded-[16px] flex flex-col cursor-pointer hover:shadow-md transition-shadow">
				<div className="p-[16px] flex flex-col gap-[16px]">
					{/* Header */}
					<div className="flex items-center gap-[16px]">
						<h3 className="font-bold text-[20px] leading-[28px] text-zinc-950 flex-1">
							{session.title}
						</h3>
						<div className="flex items-center gap-[8px] shrink-0">
							<Clock className="size-[16px] text-zinc-500" />
							<span className="text-[14px] leading-[20px] font-normal text-zinc-500">
								{formatDate(session.session_time, "p")}
							</span>
						</div>
					</div>

					{/* Topics List */}
					{isLoading ? (
						<div className="text-center py-[16px] text-zinc-500 text-[14px] leading-[21px]">
							Loading topics...
						</div>
					) : topics.length === 0 ? (
						<div className="text-center py-[16px] text-zinc-500 text-[14px] leading-[21px]">
							No topics yet. Be the first to add one!
						</div>
					) : (
						<div className="flex flex-col gap-[8px]">
							{topics.map((topic) => (
								<SimpleTopicRow
									key={topic.topic_id}
									topic={topic}
									participantId={participant?.id || ""}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}
