"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { BOFSession, TopicDetails } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/formatters";
import { TopicsService } from "@/lib/services/topics.service";
import { TopicVoteCard } from "./topic-vote-card";
import { useAuth } from "@/lib/contexts/auth-context";
import { Calendar, Clock, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";

interface BOFCardProps {
	session: BOFSession;
}

export function BOFCard({ session }: BOFCardProps) {
	const { participant } = useAuth();
	const [topics, setTopics] = useState<TopicDetails[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showTopics, setShowTopics] = useState(false);

	useEffect(() => {
		async function fetchTopics() {
			if (!showTopics) return;
			
			setIsLoading(true);
			try {
				const topicsData = await TopicsService.getTopics(session.id);
				setTopics(topicsData);
			} catch (error) {
				console.error("Error fetching topics:", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchTopics();
	}, [session.id, showTopics]);

	const handleVoteChange = () => {
		// Refresh topics after voting
		TopicsService.getTopics(session.id).then(setTopics);
	};

	return (
		<Card className="transition-all hover:shadow-lg">
			<CardContent className="p-5">
				{/* Header */}
				<div className="flex items-start justify-between gap-3 mb-4">
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-2">
							<span className="text-xl font-bold">
								Day {session.day_number}
							</span>
							<span className="text-muted-foreground">·</span>
							<span className="text-sm text-muted-foreground">
								Session {session.session_number}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-lg leading-tight">
								{session.title}
							</h3>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Calendar className="h-4 w-4" />
								<span>{formatDate(session.session_time, "MMM d")}</span>
								<Clock className="h-4 w-4" />
								<span>{formatDate(session.session_time, "p")}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Topics Toggle */}
				<div className="flex items-center justify-between mb-3">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowTopics(!showTopics)}
						className="flex items-center gap-2"
					>
						<MessageSquare className="h-4 w-4" />
						<span>Topics ({topics.length})</span>
						{showTopics ? (
							<ChevronUp className="h-4 w-4" />
						) : (
							<ChevronDown className="h-4 w-4" />
						)}
					</Button>

					<Link href={ROUTES.BOF(session.id)}>
						<Button variant="default" size="sm">
							View Details
						</Button>
					</Link>
				</div>

				{/* Topics List */}
				{showTopics && (
					<div className="space-y-3">
						{isLoading ? (
							<div className="text-center py-4 text-muted-foreground">
								Loading topics...
							</div>
						) : topics.length === 0 ? (
							<div className="text-center py-4 text-muted-foreground">
								No topics yet
							</div>
						) : (
							topics.map((topic) => (
								<TopicVoteCard
									key={topic.topic_id}
									topic={topic}
									participantId={participant?.id || ""}
									onVoteChange={handleVoteChange}
								/>
							))
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
