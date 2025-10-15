"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TopicsService } from "@/lib/services/topics.service";
import { VotesService } from "@/lib/services/votes.service";
import { supabase } from "@/lib/supabase/client";
import type { TopicDetails, Vote, BOFSession } from "@/lib/types";
import { ThumbsUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { formatTimeAgo, formatBOFSessionInfo } from "@/lib/utils/formatters";

export default function MyTopicsPage() {
	const { participant } = useAuth();
	const [myTopics, setMyTopics] = useState<TopicDetails[]>([]);
	const [myVotes, setMyVotes] = useState<Vote[]>([]);
	const [votedTopics, setVotedTopics] = useState<TopicDetails[]>([]);
	const [sessions, setSessions] = useState<Map<string, BOFSession>>(new Map());
	const [totalSessions, setTotalSessions] = useState(0);
	const [votedSessionsCount, setVotedSessionsCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			if (!participant) {
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);

				// Fetch all BOF sessions
				const { data: sessionsData } = await supabase
					.from("bof_sessions")
					.select("*")
					.order("day_number", { ascending: true })
					.order("session_number", { ascending: true });

				const sessionsMap = new Map<string, BOFSession>();
				if (sessionsData) {
					sessionsData.forEach((session) => {
						sessionsMap.set(session.id, session);
					});
					setTotalSessions(sessionsData.length);
				}
				setSessions(sessionsMap);

				// Fetch my topics
				const topics = await TopicsService.getParticipantTopics(participant.id);
				setMyTopics(topics);

				// Fetch my votes
				const votes = await VotesService.getParticipantVotes(participant.id);
				setMyVotes(votes);

				// Count unique sessions where user voted
				const uniqueSessionIds = new Set(
					votes.map((vote) => vote.bof_session_id),
				);
				setVotedSessionsCount(uniqueSessionIds.size);

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
		<div className="bg-[#f5f5f6] min-h-screen pb-[172px]">
			{/* Main content */}
			<div className="flex flex-col gap-[24px] px-[16px] pb-[24px]">
				{/* Header */}
				<div className="flex flex-col gap-[4px] pt-[16px]">
					<div className="w-full flex flex-col items-center">
						<h1 className="font-bold text-[24px] leading-[32px] text-center text-zinc-950 w-full">
							My Activity
						</h1>
					</div>
					<div className="w-full flex flex-col items-center">
						<p className="font-normal text-[16px] leading-[20px] text-center text-zinc-500 w-full">
							Your topics and votes
						</p>
					</div>
				</div>

				{/* Stats */}
				<div className="flex gap-[16px] items-start justify-center w-full">
					<div className="w-[171px] flex flex-col gap-[8px]">
						<div className="bg-white rounded-[16px] p-[16px] w-full overflow-clip">
							<div className="flex flex-col gap-[4px] items-center p-[16px] w-full">
								<div className="w-[107px] flex flex-col items-center">
									<p className="font-bold text-[24px] leading-[32px] text-center text-zinc-950 whitespace-pre">
										{myTopics.length}
									</p>
								</div>
								<div className="w-[107px] flex flex-col items-center">
									<p className="font-normal text-[12px] leading-[16px] text-center text-zinc-500 whitespace-pre">
										Topics Created
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="w-[171px] flex flex-col gap-[8px]">
						<div className="bg-white rounded-[16px] p-[16px] w-full overflow-clip">
							<div className="flex flex-col gap-[4px] items-center p-[16px] w-full">
								<div className="w-[107px] flex flex-col items-center">
									<p className="font-bold text-[24px] leading-[32px] text-center text-zinc-950 whitespace-pre">
										{votedSessionsCount}/{totalSessions}
									</p>
								</div>
								<div className="w-[107px] flex flex-col items-center">
									<p className="font-normal text-[12px] leading-[16px] text-center text-zinc-500 whitespace-pre">
										My Votes
									</p>
								</div>
							</div>
						</div>
					</div>
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
							<div className="flex flex-col gap-[8px] w-full">
								<div className="w-full flex flex-col">
									<h2 className="font-semibold text-[18px] leading-[28px] text-zinc-950 w-full">
										My Topics
									</h2>
								</div>
								{myTopics.map((topic) => {
									const session = sessions.get(topic.bof_session_id);
									return (
										<Link
											key={topic.topic_id}
											href={ROUTES.BOF(topic.bof_session_id)}
										>
											<div className="bg-white rounded-[16px] p-[16px] overflow-clip w-full">
												<div className="flex flex-col gap-[8px] w-full">
													{/* Title and session info */}
													<div className="flex flex-col gap-[8px] w-full">
														<div className="w-full flex flex-col">
															<h3 className="font-medium text-[16px] leading-[22px] tracking-[-0.32px] text-zinc-950 w-full">
																{topic.title}
															</h3>
															{session && (
																<p className="font-normal text-[14px] leading-[20px] text-zinc-500 w-full">
																	{formatBOFSessionInfo(
																		session.session_time,
																		session.session_number,
																	)}
																</p>
															)}
														</div>
													</div>

													{/* Description */}
													{topic.description && (
														<div className="w-full overflow-clip flex flex-col">
															<p className="font-normal text-[14px] leading-[20px] text-[#17171c] w-full">
																{topic.description}
															</p>
														</div>
													)}

													{/* Footer */}
													<div className="flex items-center justify-between w-full">
														<div className="flex gap-[8px] items-center">
															<ThumbsUp className="h-4 w-4 text-zinc-500" />
															<p className="font-medium text-[14px] leading-[20px] text-zinc-500 whitespace-pre">
																{topic.vote_count}
															</p>
														</div>
														<p className="font-normal text-[12px] leading-[16px] text-zinc-500 whitespace-pre">
															{formatTimeAgo(topic.created_at)}
														</p>
													</div>
												</div>
											</div>
										</Link>
									);
								})}
							</div>
						)}

						{/* My Votes */}
						{myVotes.length > 0 && (
							<div className="flex flex-col gap-[8px] w-full">
								<div className="w-full flex flex-col">
									<h2 className="font-semibold text-[18px] leading-[28px] text-zinc-950 w-full">
										My Votes
									</h2>
								</div>
								{votedTopics.map((topic) => {
									const session = sessions.get(topic.bof_session_id);
									return (
										<Link
											key={topic.topic_id}
											href={ROUTES.BOF(topic.bof_session_id)}
										>
											<div className="bg-white rounded-[16px] p-[16px] overflow-clip w-full">
												<div className="flex flex-col gap-[8px] w-full">
													{/* Title and session info */}
													<div className="flex flex-col gap-[4px] w-full">
														<div className="w-full flex flex-col">
															<h3 className="font-medium text-[16px] leading-[22px] tracking-[-0.32px] text-zinc-950 w-full">
																{topic.title}
															</h3>
														</div>
														{session && (
															<div className="w-full overflow-clip flex flex-col">
																<p className="font-normal text-[14px] leading-[20px] text-zinc-500 w-full">
																	{formatBOFSessionInfo(
																		session.session_time,
																		session.session_number,
																	)}
																</p>
															</div>
														)}
													</div>

													{/* Description */}
													{topic.description && (
														<div className="w-full overflow-clip flex flex-col">
															<p className="font-normal text-[14px] leading-[20px] text-[#17171c] w-full">
																{topic.description}
															</p>
														</div>
													)}

													{/* Footer */}
													<div className="flex items-center justify-between w-full">
														<div className="flex-1 flex flex-col min-w-0">
															<p className="font-normal text-[12px] leading-[16px] text-zinc-500 whitespace-pre">
																by {topic.author_name}
															</p>
														</div>
														<div className="flex gap-[8px] items-center shrink-0">
															<ThumbsUp className="h-4 w-4 text-zinc-500" />
															<p className="font-medium text-[14px] leading-[20px] text-zinc-500 whitespace-pre">
																{topic.vote_count}
															</p>
														</div>
													</div>
												</div>
											</div>
										</Link>
									);
								})}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
