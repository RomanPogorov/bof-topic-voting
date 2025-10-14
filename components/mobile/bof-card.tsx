"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { BOFSession, TopicDetails } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/formatters";
import { TopicsService } from "@/lib/services/topics.service";
import { useAuth } from "@/lib/contexts/auth-context";
import { Calendar, Clock, ThumbsUp, Check, Loader2 } from "lucide-react";
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
	// Defensive check: ensure topic.voters is an array before calling .some()
	const hasVoted =
		Array.isArray(topic.voters) &&
		topic.voters.some((v) => v.id === participantId);

	const handleVote = async () => {
		if (isVoting) return;
		setIsVoting(true);
		try {
			await VotesService.castVote(participantId, {
				topic_id: topic.topic_id,
				bof_session_id: topic.bof_session_id,
			});
			onVoteChange();
		} catch (error) {
			console.error("Error voting:", error);
			// Optionally show an error state
		} finally {
			setIsVoting(false);
		}
	};

	return (
		<div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
			<p className="font-medium text-sm">{topic.title}</p>
			<Button
				size="sm"
				variant={hasVoted ? "secondary" : "outline"}
				onClick={handleVote}
				disabled={isVoting}
				className={`transition-all text-xs h-8 px-3 ${
					hasVoted ? "bg-green-600 text-white hover:bg-green-700" : "bg-white"
				}`}
			>
				{isVoting ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : hasVoted ? (
					<>
						<Check className="h-4 w-4 mr-1" />
						Voted
					</>
				) : (
					<>
						<ThumbsUp className="h-4 w-4 mr-1" />
						Vote
					</>
				)}
			</Button>
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
				// Sort by vote_count descending, then created_at ascending
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
		// Re-fetch topics to update vote counts and voted status
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

	const topicsToShow = topics.slice(0, 4);

	return (
		<Card className="transition-all hover:shadow-lg">
			<CardContent className="p-4 space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<h3 className="font-bold text-lg">{session.title}</h3>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Calendar className="h-4 w-4" />
						<span>{formatDate(session.session_time, "MMM d")}</span>
						<Clock className="h-4 w-4" />
						<span>{formatDate(session.session_time, "p")}</span>
					</div>
				</div>

				{/* Topics List */}
				<div className="space-y-2">
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

				{/* Footer */}
				<Link href={ROUTES.BOF(session.id)} className="w-full">
					<Button
						variant="secondary"
						className="w-full bg-gray-800 text-white hover:bg-gray-900"
					>
						Show All Topics ({topics.length})
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}
