"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { BOFSession, TopicDetails } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/formatters";
import { TopicsService } from "@/lib/services/topics.service";
import { useAuth } from "@/lib/contexts/auth-context";
import { Clock, ThumbsUp, Check, Loader2 } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import { VotesService } from "@/lib/services/votes.service";

interface BOFCardProps {
	session: BOFSession;
}

function SimpleTopicRow({
	topic,
	participantId,
	onVoteChange,
}: {
	topic: TopicDetails;
	participantId: string;
	onVoteChange: () => void;
}) {
	const [isVoting, setIsVoting] = useState(false);
	const hasVoted =
		Array.isArray(topic.voters) &&
		topic.voters.some((v) => v.id === participantId);

	const isOwnTopic = topic.author_id === participantId;

	const handleVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isVoting || isOwnTopic) return;
		setIsVoting(true);
		try {
			await VotesService.castVote(participantId, {
				topic_id: topic.topic_id,
				bof_session_id: topic.bof_session_id,
			});
			onVoteChange();
		} catch (error) {
			console.error("Error voting:", error);
		} finally {
			setIsVoting(false);
		}
	};

	return (
		<Link
			href={ROUTES.BOF(topic.bof_session_id)}
			className="flex items-center gap-2 bg-[#f5f5f6] rounded-[6px] pl-2 pr-2 py-1 hover:bg-[#ebebed] transition-colors"
		>
			<p className="text-[15px] leading-[16px] text-zinc-950 flex-1 overflow-hidden text-ellipsis whitespace-nowrap [letter-spacing:-0.03em]">
				{topic.title}
			</p>
			<Button
				onClick={handleVote}
				disabled={isVoting || isOwnTopic}
				className={`h-[40px] w-[102px] px-3 rounded-[6px] text-[12px] font-medium leading-[16px] flex items-center justify-center gap-1 shadow-sm ${
					hasVoted
						? "bg-[#ea4a35] hover:bg-[#ea4a35]/90 text-white"
						: "bg-white hover:bg-white/90 text-zinc-900"
				}`}
			>
				{isVoting ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : hasVoted ? (
					<>
						<Check className="h-4 w-4" />
						<span>Voted</span>
						<div
							className={`flex items-center justify-center px-1.5 py-0.5 rounded-full bg-[#d52c16]`}
						>
							<span className="text-[12px] leading-[16px] font-medium text-white">
								{topic.vote_count}
							</span>
						</div>
					</>
				) : (
					<>
						<ThumbsUp className="h-4 w-4" />
						<span>Vote</span>
						<div
							className={`flex items-center justify-center px-1.5 py-0.5 rounded-full bg-[#efeff1]`}
						>
							<span className="text-[12px] leading-[16px] font-medium text-zinc-900">
								{topic.vote_count}
							</span>
						</div>
					</>
				)}
			</Button>
		</Link>
	);
}

export function BOFCard({ session }: BOFCardProps) {
	const { participant } = useAuth();
	const [topics, setTopics] = useState<TopicDetails[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showAll, setShowAll] = useState(false);

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

	const handleVoteChange = () => {
		TopicsService.getTopics(session.id).then((topicsData) => {
			const sortedTopics = topicsData.sort((a, b) => {
				if (b.vote_count !== a.vote_count) {
					return b.vote_count - a.vote_count;
				}
				return (
					new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
				);
			});
			setTopics(sortedTopics);
		});
	};

	const topicsToShow = showAll ? topics : topics.slice(0, 5);
	const remainingCount = Math.max(0, topics.length - 5);

	return (
		<Card className="rounded-[16px] shadow-none border-none">
			<CardContent className="pt-4 pb-8 px-4 flex flex-col gap-4">
				{/* Header */}
				<div className="flex items-center gap-4">
					<h3 className="font-bold text-[20px] leading-[28px] text-zinc-950 flex-1">
						{session.title}
					</h3>
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4 text-zinc-500" />
						<span className="text-[14px] leading-[20px] font-normal text-zinc-500">
							{formatDate(session.session_time, "p")}
						</span>
					</div>
				</div>

				{/* Topics List */}
				<div className="flex flex-col gap-2">
					{isLoading ? (
						<div className="text-center py-4 text-muted-foreground">
							Loading topics...
						</div>
					) : topicsToShow.length === 0 ? (
						<div className="text-center py-4 text-muted-foreground">
							No topics yet. Be the first to add one!
						</div>
					) : (
						topicsToShow.map((topic) => (
							<SimpleTopicRow
								key={topic.topic_id}
								topic={topic}
								participantId={participant?.id || ""}
								onVoteChange={handleVoteChange}
							/>
						))
					)}
				</div>

				{/* Footer Buttons */}
				<div className="flex gap-2">
					{remainingCount > 0 && (
						<Button
							variant="outline"
							onClick={() => setShowAll(!showAll)}
							className="h-[40px] w-[140px] rounded-[6px] border-2 border-neutral-500 text-neutral-500 font-medium text-[14px] leading-[16px] bg-white hover:bg-white/90"
						>
							{showAll ? "Show Less" : `Show (${remainingCount} more)`}
						</Button>
					)}
					<Link href={ROUTES.BOF(session.id)} className="flex-1">
						<Button
							variant="outline"
							className="h-[40px] w-full rounded-[6px] border-2 border-[#ea4a35] text-[#ea4a35] font-medium text-[14px] leading-[16px] bg-white hover:bg-white/90"
						>
							See Details
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
