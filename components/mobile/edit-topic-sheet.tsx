"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { TopicsService } from "@/lib/services/topics.service";
import { toast } from "sonner";

interface EditTopicSheetProps {
	topicId: string;
	currentTitle: string;
	currentDescription?: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onTopicUpdated: () => void;
}

export function EditTopicSheet({
	topicId,
	currentTitle,
	currentDescription,
	open,
	onOpenChange,
	onTopicUpdated,
}: EditTopicSheetProps) {
	const [title, setTitle] = useState(currentTitle);
	const [description, setDescription] = useState(currentDescription || "");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Update local state when props change
	useEffect(() => {
		setTitle(currentTitle);
		setDescription(currentDescription || "");
	}, [currentTitle, currentDescription]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim()) {
			toast.error("Please enter a title");
			return;
		}

		if (title.length < 5) {
			toast.error("Title must be at least 5 characters");
			return;
		}

		try {
			setIsSubmitting(true);
			await TopicsService.updateTopic(topicId, {
				title: title.trim(),
				description: description.trim() || undefined,
			});

			toast.success("Topic updated successfully!");
			onOpenChange(false);
			onTopicUpdated();
		} catch (error: unknown) {
			console.error("Update topic error:", error);
			toast.error(
				(error as Error).message || "Failed to update topic. Please try again.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="bottom" className="rounded-t-3xl">
				<SheetHeader>
					<SheetTitle>Edit Topic</SheetTitle>
					<SheetDescription>
						Update your topic title and description.
					</SheetDescription>
				</SheetHeader>

				<form onSubmit={handleSubmit} className="space-y-4 mt-6">
					<div className="space-y-2">
						<label
							htmlFor="title"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Title <span className="text-destructive">*</span>
						</label>
						<Input
							id="title"
							placeholder="Enter topic title..."
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							maxLength={255}
							disabled={isSubmitting}
							className="text-base"
						/>
						<p className="text-xs text-muted-foreground">
							{title.length}/255 characters
						</p>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="description"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Description{" "}
							<span className="text-muted-foreground">(optional)</span>
						</label>
						<Textarea
							id="description"
							placeholder="Provide more details about your topic..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							maxLength={1000}
							rows={4}
							disabled={isSubmitting}
							className="text-base resize-none"
						/>
						<p className="text-xs text-muted-foreground">
							{description.length}/1000 characters
						</p>
					</div>

					<div className="flex gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting || !title.trim()}
							className="flex-1"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Updating...
								</>
							) : (
								"Update Topic"
							)}
						</Button>
					</div>
				</form>
			</SheetContent>
		</Sheet>
	);
}
