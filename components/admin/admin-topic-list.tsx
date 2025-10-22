"use client";

import type { TopicDetails, BOFSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, ThumbsUp, ArrowRight } from "lucide-react";
import { useState } from "react";
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
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { TopicsService } from "@/lib/services/topics.service";

interface AdminTopicListProps {
	topics: TopicDetails[];
	sessions: BOFSession[];
	currentSessionId: string;
	onTopicDeleted: () => void;
	onTopicMoved: () => void;
}

export function AdminTopicList({
	topics,
	sessions,
	currentSessionId,
	onTopicDeleted,
	onTopicMoved,
}: AdminTopicListProps) {
	const [isDeleting, setIsDeleting] = useState<string | null>(null);
	const [isMoving, setIsMoving] = useState<string | null>(null);
	const [moveDialogOpen, setMoveDialogOpen] = useState<string | null>(null);

	const handleDelete = async (topicId: string) => {
		setIsDeleting(topicId);
		try {
			await TopicsService.deleteTopicAsAdmin(topicId);
			toast.success("Topic deleted successfully");
			onTopicDeleted();
		} catch (error) {
			toast.error("Failed to delete topic");
			console.error("Deletion error:", error);
		} finally {
			setIsDeleting(null);
		}
	};

	const handleMove = async (topicId: string, targetSessionId: string) => {
		setIsMoving(topicId);
		try {
			await TopicsService.moveTopicToSession(topicId, targetSessionId);
			toast.success("Topic moved successfully");
			setMoveDialogOpen(null);
			onTopicMoved();
		} catch (error) {
			toast.error("Failed to move topic");
			console.error("Move error:", error);
		} finally {
			setIsMoving(null);
		}
	};

	const availableSessions = sessions.filter((s) => s.id !== currentSessionId);

	if (topics.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2 pt-4 mt-4 border-t">
			<h4 className="text-sm font-semibold text-gray-600">
				Topics in this session ({topics.length})
			</h4>
			<div className="space-y-2">
				{topics.map((topic) => (
					<div
						key={topic.topic_id}
						className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
					>
						<div className="flex-1 min-w-0">
							<div className="text-sm font-medium">{topic.title}</div>
							<div className="flex items-center gap-3 mt-1">
								<span className="text-xs text-gray-500">
									by {topic.author_name}
								</span>
								<div className="flex items-center gap-1 text-xs text-gray-500">
									<ThumbsUp className="h-3 w-3" />
									<span>{topic.vote_count}</span>
								</div>
							</div>
						</div>

						<div className="flex items-center gap-1 shrink-0">
							{/* Move Topic Dialog */}
							<Dialog
								open={moveDialogOpen === topic.topic_id}
								onOpenChange={(open) =>
									setMoveDialogOpen(open ? topic.topic_id : null)
								}
							>
								<DialogTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
										disabled={!!isMoving || !!isDeleting}
									>
										<ArrowRight className="h-4 w-4" />
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Move Topic to Another Session</DialogTitle>
										<DialogDescription>
											Select the target BOF session for &quot;{topic.title}
											&quot;
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-2 py-4">
										{availableSessions.length === 0 ? (
											<p className="text-sm text-gray-500">
												No other sessions available
											</p>
										) : (
											availableSessions.map((session) => (
												<Button
													key={session.id}
													variant="outline"
													className="w-full justify-start"
													onClick={() => handleMove(topic.topic_id, session.id)}
													disabled={isMoving === topic.topic_id}
												>
													{isMoving === topic.topic_id ? (
														<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													) : (
														<ArrowRight className="h-4 w-4 mr-2" />
													)}
													<div className="text-left">
														<div className="font-medium">
															Day {session.day_number} · Session{" "}
															{session.session_number}
														</div>
														<div className="text-xs text-gray-500">
															{session.title}
														</div>
													</div>
												</Button>
											))
										)}
									</div>
								</DialogContent>
							</Dialog>

							{/* Delete Topic Dialog */}
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
										disabled={!!isDeleting || !!isMoving}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Are you sure?</AlertDialogTitle>
										<AlertDialogDescription>
											This action cannot be undone. This will permanently delete
											the topic and all of its associated votes.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => handleDelete(topic.topic_id)}
											className="bg-destructive hover:bg-destructive/90"
										>
											{isDeleting === topic.topic_id ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												"Delete"
											)}
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
