"use client";

export const dynamic = "force-dynamic";

import { use, useState } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useBOFDetails } from "@/lib/hooks/useBOFDetails";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { EmptyState } from "@/components/shared/empty-state";
import { TopicCard } from "@/components/mobile/topic-card";
import { CreateTopicSheet } from "@/components/mobile/create-topic-sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { BOFStatus } from "@/lib/types";
import { VotesService } from "@/lib/services/votes.service";
import { formatDate } from "@/lib/utils/formatters";
import { toast } from "sonner";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

interface BOFPageProps {
	params: Promise<{ id: string }>;
}

export default function BOFPage({ params }: BOFPageProps) {
	const { id } = use(params);
	const { participant } = useAuth();
	const { bof, topics, userVote, isLoading, error, refresh } = useBOFDetails(
		id,
		participant?.id,
	);
	const [isVoting, setIsVoting] = useState(false);

	const handleVote = async (topicId: string) => {
		if (!participant) {
			toast.error("Please sign in to vote");
			return;
		}

		try {
			setIsVoting(true);
			await VotesService.castVote(participant.id, {
				topic_id: topicId,
				bof_session_id: id,
			});

			toast.success(
				userVote ? "Vote changed successfully!" : "Vote cast successfully!",
			);
			await refresh();
		} catch (error: any) {
			toast.error(error.message || "Failed to vote");
		} finally {
			setIsVoting(false);
		}
	};

	if (isLoading) {
		return <LoadingSpinner text="Loading topics..." className="py-20" />;
	}

	if (error || !bof) {
		return (
			<div className="p-4">
				<ErrorMessage error={error || "BOF session not found"} />
			</div>
		);
	}

	const isVotingOpen = bof.status === BOFStatus.VOTING_OPEN;
	const canCreateTopic = participant && isVotingOpen;
	const hasCreatedTopic = topics.some((t) => t.author_id === participant?.id);

	return (
		<div className="pb-6 space-y-4 safe-top">
			{/* Header */}
			<div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border">
				<div className="p-4 space-y-3">
					<div className="flex items-center gap-3">
						<Link href={ROUTES.HOME}>
							<Button variant="ghost" size="icon" className="touch-target">
								<ArrowLeft className="h-5 w-5" />
							</Button>
						</Link>
						<div className="flex-1">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<span>Day {bof.day_number}</span>
								<span>·</span>
								<span>Session {bof.session_number}</span>
							</div>
							<h1 className="text-xl font-bold">{bof.title}</h1>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={refresh}
							className="touch-target"
						>
							<RefreshCw className="h-5 w-5" />
						</Button>
					</div>

					{/* Status badge */}
					<div>
						{bof.status === BOFStatus.VOTING_OPEN && (
							<Badge className="bg-green-500 hover:bg-green-600">
								🗳️ Voting Open
							</Badge>
						)}
						{bof.status === BOFStatus.VOTING_CLOSED && (
							<Badge className="bg-orange-500 hover:bg-orange-600">
								🔒 Voting Closed
							</Badge>
						)}
						{bof.status === BOFStatus.UPCOMING && (
							<Badge variant="outline">⏳ Voting Not Started</Badge>
						)}
						{bof.status === BOFStatus.COMPLETED && (
							<Badge variant="secondary">✓ Completed</Badge>
						)}
					</div>
				</div>
			</div>

			<div className="px-4 space-y-4">
				{/* Voting info */}
				{bof.voting_opens_at && bof.voting_closes_at && (
					<Card className="bg-primary/5 border-primary/20">
						<CardContent className="p-4">
							<div className="space-y-1 text-sm">
								<p>
									<span className="font-medium">Voting opens:</span>{" "}
									{formatDate(bof.voting_opens_at, "PPp")}
								</p>
								<p>
									<span className="font-medium">Voting closes:</span>{" "}
									{formatDate(bof.voting_closes_at, "PPp")}
								</p>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Voting closed message */}
				{!isVotingOpen && (
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							{bof.status === BOFStatus.UPCOMING &&
								"Voting hasn't started yet. Check back later!"}
							{bof.status === BOFStatus.VOTING_CLOSED &&
								"Voting is now closed. Results are final."}
							{bof.status === BOFStatus.COMPLETED &&
								"This session has been completed."}
						</AlertDescription>
					</Alert>
				)}

				{/* Not authenticated message */}
				{!participant && (
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							Scan your QR code to vote and create topics
						</AlertDescription>
					</Alert>
				)}

				{/* Create topic button */}
				{canCreateTopic && !hasCreatedTopic && (
					<CreateTopicSheet
						bofId={id}
						participantId={participant.id}
						onTopicCreated={refresh}
					/>
				)}

				{/* Topics list */}
				{topics.length === 0 ? (
					<EmptyState
						icon="💡"
						title="No topics yet"
						description={
							canCreateTopic
								? "Be the first to create a topic for discussion!"
								: "No topics have been submitted yet."
						}
						action={
							canCreateTopic && (
								<CreateTopicSheet
									bofId={id}
									participantId={participant.id}
									onTopicCreated={refresh}
								/>
							)
						}
					/>
				) : (
					<>
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold">
								Topics ({topics.length})
							</h2>
							{userVote && (
								<Badge variant="outline" className="bg-primary/5">
									You voted
								</Badge>
							)}
						</div>

						<div className="space-y-3">
							{topics.map((topic) => (
								<TopicCard
									key={topic.topic_id}
									topic={topic}
									isVoted={userVote?.topic_id === topic.topic_id}
									onVote={handleVote}
									isVoting={isVoting}
									disabled={!isVotingOpen || !participant}
									isOwnTopic={topic.author_id === participant?.id}
								/>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
