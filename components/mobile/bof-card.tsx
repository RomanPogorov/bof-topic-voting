"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { BOFSession, TopicDetails } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
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
		<div className="flex items-center gap-2 bg-[#f5f5f6] rounded-[6px] px-2 py-2">
			<div className="flex-1 min-w-0">
				<p className="text-[15px] leading-[16px] text-zinc-950 overflow-hidden text-ellipsis whitespace-nowrap [letter-spacing:-0.03em]">
					{topic.title}
				</p>
				<p className="text-[12px] leading-[16px] text-zinc-500 mt-0.5">
					by {topic.author_name}
				</p>
			</div>
			<div className="flex items-center gap-1 shrink-0">
				{isOwnTopic ? (
					<div className="px-3 py-1 rounded-full bg-blue-500 text-white text-[12px] font-medium">
						Lead
					</div>
				) : hasJoined ? (
					<div className="px-3 py-1 rounded-full bg-[#ea4a35] text-white text-[12px] font-medium">
						Joined
					</div>
				) : null}
				<div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#efeff1]">
					<Users className="h-3 w-3 text-zinc-500" />
					<span className="text-[12px] leading-[16px] font-medium text-zinc-900">
						{topic.vote_count || 0}
					</span>
				</div>
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
			<Card className="rounded-[16px] shadow-none border-none hover:shadow-md transition-shadow cursor-pointer">
				<CardContent className="pt-4 pb-4 px-4 flex flex-col gap-4">
					{/* Header */}
					<div className="flex items-center gap-4">
						<h3 className="font-bold text-[20px] leading-[28px] text-zinc-950 flex-1">
							{session.title}
						</h3>
						<div className="flex items-center gap-2 shrink-0">
							<Clock className="h-4 w-4 text-zinc-500" />
							<span className="text-[14px] leading-[20px] font-normal text-zinc-500">
								{formatDate(session.session_time, "p")}
							</span>
						</div>
					</div>

					{/* Topics List */}
					<div className="flex flex-col gap-2">
						{isLoading ? (
							<div className="text-center py-4 text-zinc-500 text-[14px]">
								Loading topics...
							</div>
						) : topics.length === 0 ? (
							<div className="text-center py-4 text-zinc-500 text-[14px]">
								No topics yet. Be the first to add one!
							</div>
						) : (
							topics.map((topic) => (
								<SimpleTopicRow
									key={topic.topic_id}
									topic={topic}
									participantId={participant?.id || ""}
								/>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
