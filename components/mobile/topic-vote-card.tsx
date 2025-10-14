"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { TopicDetails } from "@/lib/types";
import { VoteState } from "@/lib/types";
import { VotesService } from "@/lib/services/votes.service";
import { ThumbsUp, Loader2, Users } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils/formatters";

interface TopicVoteCardProps {
	topic: TopicDetails;
	participantId: string;
	onVoteChange?: () => void;
}

export function TopicVoteCard({
	topic,
	participantId,
	onVoteChange,
}: TopicVoteCardProps) {
	const [voteState, setVoteState] = useState<VoteState>(VoteState.NOT_VOTED);
	const [isVoting, setIsVoting] = useState(false);

	const handleVote = async () => {
		if (isVoting) return;

		try {
			setIsVoting(true);
			setVoteState(VoteState.VOTING);

			await VotesService.castVote(participantId, {
				topic_id: topic.topic_id,
				bof_session_id: topic.bof_session_id,
			});
			setVoteState(VoteState.VOTED);
			onVoteChange?.();
		} catch (error) {
			console.error("Error voting:", error);
			setVoteState(VoteState.ERROR);
		} finally {
			setIsVoting(false);
		}
	};

	const isVoted = voteState === VoteState.VOTED;
	const isVotingThis = isVoting;

	return (
		<Card className="bg-gray-50 border-gray-200">
			<CardContent className="p-4">
				<div className="space-y-3">
					{/* Topic Header */}
					<div className="space-y-2">
						<h4 className="font-semibold text-sm leading-tight">
							{topic.title}
						</h4>
						{topic.description && (
							<p className="text-xs text-muted-foreground line-clamp-2">
								{topic.description}
							</p>
						)}
					</div>

					{/* Author Info */}
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<Avatar className="h-5 w-5">
							<AvatarFallback className="text-xs">
								{topic.author_name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<span>{topic.author_name}</span>
						{topic.author_company && (
							<>
								<span>·</span>
								<span>{topic.author_company}</span>
							</>
						)}
						<span>·</span>
						<span>{formatTimeAgo(topic.created_at)}</span>
					</div>

					{/* Vote Button and Stats */}
					<div className="flex items-center justify-between">
						<Button
							size="sm"
							variant={isVoted ? "default" : "outline"}
							onClick={handleVote}
							disabled={isVotingThis}
							className="h-8 px-3 text-xs"
						>
							{isVotingThis ? (
								<Loader2 className="h-3 w-3 animate-spin" />
							) : (
								<ThumbsUp className="h-3 w-3" />
							)}
							<span className="ml-1">{isVoted ? "Change Vote" : "Vote"}</span>
						</Button>

						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<div className="flex items-center gap-1">
								<ThumbsUp className="h-3 w-3" />
								<span className="font-medium">{topic.vote_count}</span>
							</div>
							{topic.voters.length > 0 && (
								<div className="flex items-center gap-1">
									<Users className="h-3 w-3" />
									<span>{topic.voters.length}</span>
								</div>
							)}
						</div>
					</div>

					{/* Voters List */}
					{topic.voters.length > 0 && (
						<div className="space-y-1">
							<div className="text-xs font-medium text-muted-foreground">
								Voted by:
							</div>
							<div className="flex flex-wrap gap-1">
								{topic.voters.map((voter) => (
									<Badge
										key={voter.id}
										variant="secondary"
										className="text-xs px-2 py-0.5"
									>
										{voter.name}
									</Badge>
								))}
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
