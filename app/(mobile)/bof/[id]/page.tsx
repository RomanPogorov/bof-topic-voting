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
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { VotesService } from "@/lib/services/votes.service";
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
	const [votingTopicId, setVotingTopicId] = useState<string | null>(null);

	const handleVote = async (topicId: string) => {
		if (!participant) {
			toast.error("Please sign in to vote");
			return;
		}

		try {
			setIsVoting(true);
			setVotingTopicId(topicId);
			await VotesService.castVote(participant.id, {
				topic_id: topicId,
				bof_session_id: id,
			});

			toast.success(
				userVote ? "Vote changed successfully!" : "Vote cast successfully!",
			);
			await refresh();
		} catch (error: unknown) {
			toast.error((error as Error).message || "Failed to vote");
		} finally {
			setIsVoting(false);
			setVotingTopicId(null);
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

	const canCreateTopic = participant;
	const hasCreatedTopic = topics.some((t) => t.author_id === participant?.id);
	const isAdmin = participant?.role === "admin";

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
				</div>
			</div>

			<div className="px-4 space-y-4">
				{/* Not authenticated message */}
				{!participant && (
					<div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
						<div className="flex items-center gap-2">
							<AlertCircle className="h-4 w-4 text-orange-600" />
							<p className="text-sm text-orange-800">
								Scan your QR code to vote and create topics
							</p>
						</div>
					</div>
				)}

				{/* Create topic button */}
				{canCreateTopic && (!hasCreatedTopic || isAdmin) && (
					<CreateTopicSheet
						bofId={id}
						participantId={participant.id}
						onTopicCreated={refresh}
						disabled={hasCreatedTopic && !isAdmin}
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
							canCreateTopic &&
							(!hasCreatedTopic || isAdmin) && (
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
									disabled={!participant}
									isOwnTopic={topic.author_id === participant?.id}
									votingTopicId={votingTopicId}
								/>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
