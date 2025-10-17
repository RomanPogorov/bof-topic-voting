"use client";

export const dynamic = "force-dynamic";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { useBOFDetails } from "@/lib/hooks/useBOFDetails";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { EmptyState } from "@/components/shared/empty-state";
import { TopicCard } from "@/components/mobile/topic-card";
import { CreateTopicSheet } from "@/components/mobile/create-topic-sheet";
import { EditTopicSheet } from "@/components/mobile/edit-topic-sheet";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { VotesService } from "@/lib/services/votes.service";
import { TopicsService } from "@/lib/services/topics.service";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BOFPageProps {
	params: Promise<{ id: string }>;
}

export default function BOFPage({ params }: BOFPageProps) {
	const { id } = use(params);
	const router = useRouter();
	const { participant } = useAuth();
	const { bof, topics, userVote, isLoading, error, refresh } = useBOFDetails(
		id,
		participant?.id,
	);
	const [isJoining, setIsJoining] = useState(false);
	const [joiningTopicId, setJoiningTopicId] = useState<string | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [topicToDelete, setTopicToDelete] = useState<string | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [topicToEdit, setTopicToEdit] = useState<string | null>(null);

	const handleJoin = async (topicId: string) => {
		if (!participant) {
			toast.error("Please sign in to join");
			return;
		}

		// Check if user has created a topic in this session
		if (hasCreatedTopic) {
			toast.error("You are leading your own topic and cannot join others");
			return;
		}

		try {
			setIsJoining(true);
			setJoiningTopicId(topicId);
			await VotesService.joinTopic(participant.id, {
				topic_id: topicId,
				bof_session_id: id,
			});

			toast.success(
				userVote ? "Joined another topic!" : "Successfully joined!",
			);
			await refresh();
		} catch (error: unknown) {
			toast.error((error as Error).message || "Failed to join");
		} finally {
			setIsJoining(false);
			setJoiningTopicId(null);
		}
	};

	const handleEdit = (topicId: string) => {
		// Check if token exists before allowing edit
		const token =
			typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
		if (!token) {
			toast.error("Session expired. Please scan your QR code again", {
				duration: 4000,
			});
			return;
		}

		setTopicToEdit(topicId);
		setEditDialogOpen(true);
	};

	const handleDelete = (topicId: string) => {
		setTopicToDelete(topicId);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!topicToDelete) return;

		// Check if token exists before allowing delete
		const token =
			typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
		if (!token) {
			toast.error("Сессия истекла. Пожалуйста, отсканируйте QR код снова", {
				duration: 4000,
			});
			setDeleteDialogOpen(false);
			setTopicToDelete(null);
			return;
		}

		try {
			await TopicsService.deleteTopicAsAdmin(topicToDelete);
			toast.success("Topic deleted successfully!");
			await refresh();
		} catch (error: unknown) {
			toast.error((error as Error).message || "Failed to delete topic");
		} finally {
			setDeleteDialogOpen(false);
			setTopicToDelete(null);
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
		<div className="bg-[#e7e7e9] flex flex-col items-start min-h-screen">
			{/* Header - sticky */}
			<div className="backdrop-blur-[2px] bg-[rgba(255,255,255,0.95)] border-b border-zinc-200 sticky top-0 w-full z-[2] px-[16px] pt-[16px] pb-[17px]">
				<div className="flex gap-[12px] items-center w-full">
					{/* Back button */}
					<button
						type="button"
						onClick={() => router.back()}
						className="bg-[#f5f5f6] flex items-center justify-center rounded-[38px] size-[44px] shrink-0"
					>
						<ArrowLeft className="h-4 w-4" />
					</button>

					{/* Title & Subtitle */}
					<div className="flex-1 flex flex-col min-w-0">
						<h1 className="font-bold text-[20px] leading-[28px] text-zinc-950">
							{bof.title}
						</h1>
						<div className="flex gap-[8px] items-center">
							<span className="font-normal text-[14px] leading-[20px] text-zinc-500 whitespace-pre">
								{new Date(bof.session_time).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								})}{" "}
								| Session {bof.session_number}
							</span>
						</div>
					</div>

					{/* Refresh button */}
					<button
						type="button"
						onClick={refresh}
						className="bg-[#f5f5f6] flex items-center justify-center rounded-[38px] size-[44px] shrink-0"
					>
						<RefreshCw className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Main content */}
			<div className="flex flex-col gap-[16px] px-[16px] pt-[16px] w-full z-[1]">
				{/* Topics section */}
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
						{/* Topics header */}
						<div className="flex flex-col items-center w-full">
							<h2 className="font-semibold text-[18px] leading-[28px] text-zinc-950 text-center">
								Topics ({topics.length})
							</h2>
						</div>

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
						<div className="flex flex-col gap-[24px] w-full">
							{topics.map((topic) => {
								const isOwnTopic = topic.author_id === participant?.id;

								return (
									<TopicCard
										key={topic.topic_id}
										topic={topic}
										isJoined={userVote?.topic_id === topic.topic_id}
										onJoin={handleJoin}
										isJoining={isJoining}
										disabled={!participant || hasCreatedTopic}
										isOwnTopic={isOwnTopic}
										joiningTopicId={joiningTopicId}
										onEdit={isOwnTopic ? handleEdit : undefined}
										onDelete={isOwnTopic ? handleDelete : undefined}
										currentUserId={participant?.id}
										isLeading={hasCreatedTopic}
									/>
								);
							})}
						</div>
					</>
				)}
			</div>

			{/* Edit Topic Sheet */}
			{topicToEdit &&
				(() => {
					const topic = topics.find((t) => t.topic_id === topicToEdit);
					return topic ? (
						<EditTopicSheet
							topicId={topicToEdit}
							currentTitle={topic.title}
							currentDescription={topic.description || undefined}
							open={editDialogOpen}
							onOpenChange={setEditDialogOpen}
							onTopicUpdated={async () => {
								setTopicToEdit(null);
								await refresh();
							}}
						/>
					) : null;
				})()}

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Topic?</AlertDialogTitle>
						<AlertDialogDescription>
							{topicToDelete &&
								(() => {
									const topic = topics.find(
										(t) => t.topic_id === topicToDelete,
									);
									const joinedCount = topic?.joined_users?.length || 0;
									return joinedCount > 0
										? `${joinedCount} ${joinedCount === 1 ? "person has" : "people have"} joined this topic. Are you sure you want to delete it?`
										: "Are you sure you want to delete this topic? This action cannot be undone.";
								})()}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDelete}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
