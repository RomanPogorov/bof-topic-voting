"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, Loader2 } from "lucide-react";
import { TopicsService } from "@/lib/services/topics.service";
import { toast } from "sonner";
import { ErrorCodes } from "@/lib/types";

interface CreateTopicSheetProps {
	bofId: string;
	participantId: string;
	onTopicCreated: () => void;
	disabled?: boolean;
}

export function CreateTopicSheet({
	bofId,
	participantId,
	onTopicCreated,
	disabled,
}: CreateTopicSheetProps) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

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
			await TopicsService.createTopic(participantId, {
				bof_session_id: bofId,
				title: title.trim(),
				description: description.trim() || undefined,
			});

			toast.success("🎉 Topic created successfully!");
			setOpen(false);
			setTitle("");
			setDescription("");
			onTopicCreated();
		} catch (error: any) {
			console.error("Create topic error:", error);
			if (error.message === ErrorCodes.ALREADY_CREATED_TOPIC) {
				toast.error("You've already created a topic for this session");
			} else {
				toast.error(
					error.message || "Failed to create topic. Please try again.",
				);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<button
					type="button"
					disabled={disabled}
					className="bg-[#2378e1] w-full h-[40px] flex gap-[8px] items-center justify-center px-[16px] rounded-[6px] hover:bg-[#1e68c9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<Plus className="size-[16px] text-[#f9f9f9]" />
					<span className="font-medium text-[14px] leading-[20px] text-[#f9f9f9]">
						Submit Topic
					</span>
				</button>
			</SheetTrigger>
			<SheetContent side="bottom" className="rounded-t-3xl">
				<SheetHeader>
					<SheetTitle>Create New Topic</SheetTitle>
					<SheetDescription>
						Propose a topic for discussion. You can only create one topic per
						session.
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
							onClick={() => setOpen(false)}
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
									Submitting...
								</>
							) : (
								"Submit Topic"
							)}
						</Button>
					</div>
				</form>
			</SheetContent>
		</Sheet>
	);
}
