"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { TopicDetails } from "@/lib/types";
import { JoinState } from "@/lib/types";
import { VotesService } from "@/lib/services/votes.service";
import { Loader2, Users } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils/formatters";

interface TopicVoteCardProps {
	topic: TopicDetails;
	participantId: string;
	onVoteChange?: () => void;
	hasCreatedTopic?: boolean;
}

export function TopicVoteCard({
	topic,
	participantId,
	onVoteChange,
	hasCreatedTopic = false,
}: TopicVoteCardProps) {
	const [joinState, setJoinState] = useState<JoinState>(JoinState.NOT_JOINED);
	const [isJoining, setIsJoining] = useState(false);
	const isOwnTopic = topic.author_id === participantId;

	const handleJoin = async () => {
		if (isJoining || isOwnTopic || hasCreatedTopic) return;

		try {
			setIsJoining(true);
			setJoinState(JoinState.JOINING);

			await VotesService.joinTopic(participantId, {
				topic_id: topic.topic_id,
				bof_session_id: topic.bof_session_id,
			});
			setJoinState(JoinState.JOINED);
			onVoteChange?.();
		} catch (error) {
			console.error("Error joining:", error);
			setJoinState(JoinState.ERROR);
		} finally {
			setIsJoining(false);
		}
	};

	const isJoined = joinState === JoinState.JOINED;
	const isJoiningThis = isJoining;
	const isDisabled = hasCreatedTopic && !isOwnTopic;

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

					{/* Join Button and Stats */}
					<div className="space-y-1">
						{isDisabled && (
							<p className="text-[10px] text-zinc-500 text-center">
								You're leading your own topic
							</p>
						)}
						<div className="flex items-center justify-between">
							<Button
								size="sm"
								variant={
									isOwnTopic ? "default" : isJoined ? "default" : "outline"
								}
								onClick={handleJoin}
								disabled={isJoiningThis || isOwnTopic || isDisabled}
								className={`h-8 px-3 text-xs ${
									isOwnTopic
										? "bg-blue-500 hover:bg-blue-600"
										: isJoined
											? "bg-[#ea4a35] hover:bg-[#ea4a35]/90"
											: isDisabled
												? "bg-gray-200 cursor-not-allowed"
												: ""
								}`}
							>
								{isJoiningThis ? (
									<Loader2 className="h-3 w-3 animate-spin" />
								) : (
									<Users className="h-3 w-3" />
								)}
								<span className="ml-1">
									{isOwnTopic ? "Lead" : isJoined ? "Joined" : "Join"}
								</span>
							</Button>

							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<div className="flex items-center gap-1">
									<Users className="h-3 w-3" />
									<span className="font-medium">{topic.vote_count || 0}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Joined Users List */}
					{topic.joined_users && topic.joined_users.length > 0 && (
						<div className="space-y-1">
							<div className="text-xs font-medium text-muted-foreground">
								Joined by:
							</div>
							<div className="flex flex-wrap gap-1">
								{topic.joined_users.map((user) => (
									<Badge
										key={user.id}
										variant="secondary"
										className="text-xs px-2 py-0.5"
									>
										{user.name}
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
