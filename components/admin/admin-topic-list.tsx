"use client";

import type { Topic } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
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
import { TopicsService } from "@/lib/services/topics.service";

interface AdminTopicListProps {
	topics: Topic[];
	onTopicDeleted: () => void;
}

export function AdminTopicList({
	topics,
	onTopicDeleted,
}: AdminTopicListProps) {
	const [isDeleting, setIsDeleting] = useState<string | null>(null);

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
						key={topic.id}
						className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
					>
						<span className="text-sm">{topic.title}</span>

						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
									disabled={!!isDeleting}
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
										onClick={() => handleDelete(topic.id)}
										className="bg-destructive hover:bg-destructive/90"
									>
										{isDeleting === topic.id ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											"Delete"
										)}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				))}
			</div>
		</div>
	);
}
