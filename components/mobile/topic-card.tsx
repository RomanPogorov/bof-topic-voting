"use client";

import { useState } from "react";
import type { TopicDetails } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThumbsUp, Check, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getInitials } from "@/lib/utils/formatters";

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
	const [isExpanded, setIsExpanded] = useState(false);
	const hasDescription = !!topic.description;
	const isThisTopicVoting = votingTopicId === topic.topic_id;

	const handleVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!disabled && !isOwnTopic) {
			await onVote(topic.topic_id);
		}
	};

	return (
		<Card
			className={cn(
				"transition-all",
				isVoted && "ring-2 ring-primary",
				topic.rank && topic.rank <= 5 && "border-yellow-500 border-2",
			)}
		>
			<CardContent className="p-4 space-y-3">
				{/* Top badges */}
				<div className="flex items-center gap-2 flex-wrap">
					{topic.rank && topic.rank <= 5 && (
						<Badge className="bg-yellow-500 hover:bg-yellow-600">
							{topic.rank === 1 && "🥇"}
							{topic.rank === 2 && "🥈"}
							{topic.rank === 3 && "🥉"}
							{topic.rank > 3 && `⭐ #${topic.rank}`}
							{topic.rank === 1 && " Top"}
							{topic.rank > 1 && topic.rank <= 5 && ` Top ${topic.rank}`}
						</Badge>
					)}
					{isOwnTopic && (
						<Badge variant="secondary" className="bg-blue-100 text-blue-700">
							Your Topic
						</Badge>
					)}
				</div>

				{/* Title */}
				<h3 className="font-semibold text-lg leading-tight">{topic.title}</h3>

				{/* Author */}
				<div className="flex items-center gap-2">
					<Avatar className="h-8 w-8">
						<AvatarFallback className="text-xs bg-primary/10">
							{getInitials(topic.author_name)}
						</AvatarFallback>
					</Avatar>
					<div className="text-sm text-muted-foreground min-w-0">
						<span className="font-medium text-foreground">
							{topic.author_name}
						</span>
						{topic.author_company && (
							<>
								<span className="mx-1">·</span>
								<span className="truncate">{topic.author_company}</span>
							</>
						)}
					</div>
				</div>

				{/* Description */}
				{hasDescription && (
					<div>
						<p
							className={cn(
								"text-sm text-muted-foreground transition-all",
								!isExpanded && "line-clamp-2",
							)}
						>
							{topic.description}
						</p>
						{topic.description && topic.description.length > 100 && (
							<button
								type="button"
								onClick={() => setIsExpanded(!isExpanded)}
								className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
							>
								{isExpanded ? (
									<>
										Show less <ChevronUp className="h-3 w-3" />
									</>
								) : (
									<>
										Show more <ChevronDown className="h-3 w-3" />
									</>
								)}
							</button>
						)}
					</div>
				)}

				{/* Vote section */}
				<div className="flex items-center justify-between pt-2">
					<div className="flex items-center gap-2 text-sm">
						<ThumbsUp className="h-4 w-4 text-muted-foreground" />
						<span className="font-semibold">{topic.vote_count}</span>
						<span className="text-muted-foreground">
							{topic.vote_count === 1 ? "vote" : "votes"}
						</span>
					</div>

					<Button
						size="sm"
						variant={isVoted ? "default" : "outline"}
						onClick={handleVote}
						disabled={disabled || isThisTopicVoting || isOwnTopic}
						className={cn(
							"min-w-[100px] touch-target",
							isVoted && "bg-primary hover:bg-primary/90",
						)}
					>
						{isThisTopicVoting ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : isVoted ? (
							<>
								<Check className="h-4 w-4 mr-1" />
								Change Vote
							</>
						) : isOwnTopic ? (
							"Your Topic"
						) : (
							<>
								<ThumbsUp className="h-4 w-4 mr-1" />
								Vote
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
