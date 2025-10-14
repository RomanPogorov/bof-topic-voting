"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TopicsService } from "@/lib/services/topics.service";
import { VotesService } from "@/lib/services/votes.service";
import { TopicDetails, Vote } from "@/lib/types";
import { ThumbsUp, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { formatTimeAgo } from "@/lib/utils/formatters";

export default function MyTopicsPage() {
	const { participant } = useAuth();
	const [myTopics, setMyTopics] = useState<TopicDetails[]>([]);
	const [myVotes, setMyVotes] = useState<Vote[]>([]);
	const [votedTopics, setVotedTopics] = useState<TopicDetails[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			if (!participant) {
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);

				// Fetch my topics
				const topics = await TopicsService.getParticipantTopics(participant.id);
				setMyTopics(topics);

				// Fetch my votes
				const votes = await VotesService.getParticipantVotes(participant.id);
				setMyVotes(votes);

				// Fetch topics I voted for
				const topicPromises = votes.map((vote) =>
					TopicsService.getTopic(vote.topic_id),
				);
				const topicsData = await Promise.all(topicPromises);
				setVotedTopics(topicsData.filter((t) => t !== null) as TopicDetails[]);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();
	}, [participant]);

	if (!participant) {
		return (
			<div className="p-4 py-8">
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Please scan your QR code to view your topics
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (isLoading) {
		return <LoadingSpinner text="Loading your activity..." className="py-20" />;
	}

	const hasNoActivity = myTopics.length === 0 && myVotes.length === 0;

	return (
		<div className="p-4 space-y-6 pb-6 safe-top">
			{/* Header */}
			<div className="text-center pt-4">
				<h1 className="text-2xl font-bold">My Activity</h1>
				<p className="text-muted-foreground text-sm mt-1">
					Your topics and votes
				</p>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-4">
				<Card>
					<CardContent className="p-4 text-center">
						<FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
						<p className="text-2xl font-bold">{myTopics.length}</p>
						<p className="text-xs text-muted-foreground">Topics Created</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<ThumbsUp className="h-6 w-6 mx-auto mb-2 text-primary" />
						<p className="text-2xl font-bold">{myVotes.length}</p>
						<p className="text-xs text-muted-foreground">Votes Cast</p>
					</CardContent>
				</Card>
			</div>

			{hasNoActivity ? (
				<EmptyState
					icon="🎯"
					title="No activity yet"
					description="Start by creating a topic or voting in a BOF session"
				/>
			) : (
				<>
					{/* My Topics */}
					{myTopics.length > 0 && (
						<div className="space-y-3">
							<h2 className="text-lg font-semibold">My Topics</h2>
							{myTopics.map((topic) => (
								<Link
									key={topic.topic_id}
									href={ROUTES.BOF(topic.bof_session_id)}
								>
									<Card className="transition-all hover:shadow-md active:scale-[0.98]">
										<CardContent className="p-4">
											<div className="space-y-2">
												<div className="flex items-start justify-between gap-2">
													<h3 className="font-semibold leading-tight flex-1">
														{topic.title}
													</h3>
													{topic.rank && topic.rank <= 5 && (
														<Badge className="bg-yellow-500 flex-shrink-0">
															Top {topic.rank}
														</Badge>
													)}
												</div>

												{topic.description && (
													<p className="text-sm text-muted-foreground line-clamp-2">
														{topic.description}
													</p>
												)}

												<div className="flex items-center justify-between text-sm">
													<div className="flex items-center gap-2 text-muted-foreground">
														<ThumbsUp className="h-4 w-4" />
														<span className="font-medium">
															{topic.vote_count}
														</span>
														<span>
															{topic.vote_count === 1 ? "vote" : "votes"}
														</span>
													</div>
													<span className="text-xs text-muted-foreground">
														{formatTimeAgo(topic.created_at)}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					)}

					{/* My Votes */}
					{myVotes.length > 0 && (
						<div className="space-y-3">
							<h2 className="text-lg font-semibold">My Votes</h2>
							{votedTopics.map((topic, index) => {
								const vote = myVotes[index];
								return (
									<Link
										key={topic.topic_id}
										href={ROUTES.BOF(topic.bof_session_id)}
									>
										<Card className="transition-all hover:shadow-md active:scale-[0.98]">
											<CardContent className="p-4">
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<Badge variant="outline" className="bg-primary/5">
															Voted
														</Badge>
														{topic.rank && topic.rank <= 5 && (
															<Badge className="bg-yellow-500">
																Top {topic.rank}
															</Badge>
														)}
													</div>

													<h3 className="font-semibold leading-tight">
														{topic.title}
													</h3>

													<div className="flex items-center justify-between text-sm">
														<div className="text-muted-foreground">
															by {topic.author_name}
														</div>
														<div className="flex items-center gap-2 text-muted-foreground">
															<ThumbsUp className="h-4 w-4" />
															<span>{topic.vote_count}</span>
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									</Link>
								);
							})}
						</div>
					)}
				</>
			)}
		</div>
	);
}
