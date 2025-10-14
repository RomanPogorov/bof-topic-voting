"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import type { TopicDetails } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Eye, EyeOff, Trash2, User, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import { toast } from "sonner";

export default function ModerationPage() {
	const [topics, setTopics] = useState<TopicDetails[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");

	async function fetchTopics() {
		try {
			setIsLoading(true);
			let query = supabase
				.from("topic_details")
				.select("*")
				.order("created_at", { ascending: false });

			if (filter === "visible") {
				query = query.eq("is_hidden", false);
			} else if (filter === "hidden") {
				query = query.eq("is_hidden", true);
			}

			const { data, error } = await query;

			if (error) throw error;
			setTopics(data || []);
		} catch (err) {
			console.error("Error fetching topics:", err);
			toast.error("Failed to load topics");
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchTopics();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filter]);

	async function handleToggleVisibility(
		topicId: string,
		currentlyHidden: boolean,
	) {
		try {
			const { error } = await supabase
				.from("topics")
				.update({ is_hidden: !currentlyHidden })
				.eq("id", topicId);

			if (error) throw error;

			toast.success(
				currentlyHidden
					? "Topic unhidden successfully"
					: "Topic hidden successfully",
			);
			fetchTopics();
		} catch (err) {
			console.error("Error toggling visibility:", err);
			toast.error("Failed to update topic");
		}
	}

	async function handleDelete(topicId: string) {
		if (
			!confirm(
				"Are you sure you want to delete this topic? This action cannot be undone.",
			)
		) {
			return;
		}

		try {
			const { error } = await supabase
				.from("topics")
				.delete()
				.eq("id", topicId);

			if (error) throw error;

			toast.success("Topic deleted successfully");
			fetchTopics();
		} catch (err) {
			console.error("Error deleting topic:", err);
			toast.error("Failed to delete topic");
		}
	}

	const visibleCount = topics.filter((t) => !t.is_hidden).length;
	const hiddenCount = topics.filter((t) => t.is_hidden).length;

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-4xl font-bold">Topic Moderation</h1>
					<p className="text-muted-foreground mt-2">
						Review and manage submitted topics
					</p>
				</div>

				<div className="flex gap-2">
					<Button
						variant={filter === "all" ? "default" : "outline"}
						onClick={() => setFilter("all")}
					>
						All ({topics.length})
					</Button>
					<Button
						variant={filter === "visible" ? "default" : "outline"}
						onClick={() => setFilter("visible")}
					>
						Visible ({visibleCount})
					</Button>
					<Button
						variant={filter === "hidden" ? "default" : "outline"}
						onClick={() => setFilter("hidden")}
					>
						Hidden ({hiddenCount})
					</Button>
				</div>
			</div>

			{/* Topics List */}
			{isLoading ? (
				<LoadingSpinner text="Loading topics..." className="py-20" />
			) : topics.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center text-muted-foreground">
						No topics found
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{topics.map((topic) => (
						<Card key={topic.topic_id}>
							<CardHeader>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<CardTitle className="text-xl">{topic.title}</CardTitle>
											{topic.is_hidden && (
												<Badge variant="destructive">Hidden</Badge>
											)}
										</div>
										{topic.description && (
											<p className="text-sm text-muted-foreground">
												{topic.description}
											</p>
										)}
									</div>

									<div className="flex gap-2">
										<Button
											variant="outline"
											size="icon"
											onClick={() =>
												handleToggleVisibility(topic.topic_id, topic.is_hidden)
											}
											title={topic.is_hidden ? "Unhide topic" : "Hide topic"}
										>
											{topic.is_hidden ? (
												<Eye className="h-4 w-4" />
											) : (
												<EyeOff className="h-4 w-4" />
											)}
										</Button>
										<Button
											variant="outline"
											size="icon"
											onClick={() => handleDelete(topic.topic_id)}
											title="Delete topic"
											className="text-destructive hover:text-destructive"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
									<div className="flex items-center gap-1">
										<User className="h-4 w-4" />
										<span>{topic.participant_name || "Anonymous"}</span>
									</div>
									<div className="flex items-center gap-1">
										<Calendar className="h-4 w-4" />
										<span>{formatDate(topic.created_at, "PPp")}</span>
									</div>
									<div className="flex items-center gap-1">
										<span>🗳️</span>
										<span>{topic.vote_count} votes</span>
									</div>
									<div>
										<Badge variant="outline">
											Day {topic.bof_session_id ? "?" : "?"}
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
