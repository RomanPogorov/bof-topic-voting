"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import type { Participant } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Search, User, Building2, Calendar, Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";

interface ParticipantWithStats extends Participant {
	votes_cast?: number;
	topics_created?: number;
	achievements_count?: number;
	total_points?: number;
}

export default function ParticipantsPage() {
	const [participants, setParticipants] = useState<ParticipantWithStats[]>([]);
	const [filteredParticipants, setFilteredParticipants] = useState<
		ParticipantWithStats[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		fetchParticipants();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredParticipants(participants);
			return;
		}

		const query = searchQuery.toLowerCase();
		const filtered = participants.filter(
			(p) =>
				p.name.toLowerCase().includes(query) ||
				p.company?.toLowerCase().includes(query) ||
				p.email?.toLowerCase().includes(query),
		);
		setFilteredParticipants(filtered);
	}, [searchQuery, participants]);

	async function fetchParticipants() {
		try {
			setIsLoading(true);

			// Fetch participants with stats
			const { data: participantsData, error: participantsError } =
				await supabase
					.from("participants")
					.select("*")
					.order("created_at", { ascending: false });

			if (participantsError) throw participantsError;

			// Fetch stats for each participant
			const participantsWithStats = await Promise.all(
				(participantsData || []).map(async (participant) => {
					const [votesRes, topicsRes, achievementsRes] = await Promise.all([
						supabase
							.from("votes")
							.select("id", { count: "exact", head: true })
							.eq("participant_id", participant.id),
						supabase
							.from("topics")
							.select("id", { count: "exact", head: true })
							.eq("participant_id", participant.id),
						supabase
							.from("participant_achievements")
							.select("achievement:achievements(points)", { count: "exact" })
							.eq("participant_id", participant.id),
					]);

					const totalPoints =
						achievementsRes.data?.reduce((sum, pa) => {
							const achievement = pa.achievement as { points?: number } | null;
							return sum + (achievement?.points || 0);
						}, 0) || 0;

					return {
						...participant,
						votes_cast: votesRes.count || 0,
						topics_created: topicsRes.count || 0,
						achievements_count: achievementsRes.count || 0,
						total_points: totalPoints,
					};
				}),
			);

			setParticipants(participantsWithStats);
			setFilteredParticipants(participantsWithStats);
		} catch (err) {
			console.error("Error fetching participants:", err);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-4xl font-bold">Participants</h1>
				<p className="text-muted-foreground mt-2">
					View and manage registered participants
				</p>
			</div>

			{/* Search */}
			<Card>
				<CardContent className="pt-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by name, company, or email..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardContent className="pt-6">
						<div className="text-3xl font-bold">{participants.length}</div>
						<div className="text-sm text-muted-foreground">
							Total Participants
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-3xl font-bold">
							{participants.reduce((sum, p) => sum + (p.votes_cast || 0), 0)}
						</div>
						<div className="text-sm text-muted-foreground">
							Total Votes Cast
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-3xl font-bold">
							{participants.reduce(
								(sum, p) => sum + (p.topics_created || 0),
								0,
							)}
						</div>
						<div className="text-sm text-muted-foreground">
							Total Topics Created
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Participants List */}
			{isLoading ? (
				<LoadingSpinner text="Loading participants..." className="py-20" />
			) : filteredParticipants.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center text-muted-foreground">
						{searchQuery
							? "No participants found matching your search"
							: "No participants registered yet"}
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{filteredParticipants.map((participant) => (
						<Card key={participant.id}>
							<CardContent className="pt-6">
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<User className="h-5 w-5 text-muted-foreground" />
											<h3 className="text-lg font-semibold">
												{participant.name}
											</h3>
										</div>

										<div className="space-y-1 text-sm text-muted-foreground">
											{participant.company && (
												<div className="flex items-center gap-2">
													<Building2 className="h-4 w-4" />
													<span>{participant.company}</span>
												</div>
											)}
											{participant.email && (
												<div className="flex items-center gap-2">
													<span>📧</span>
													<span>{participant.email}</span>
												</div>
											)}
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4" />
												<span>
													Registered {formatDate(participant.created_at, "PPp")}
												</span>
											</div>
										</div>
									</div>

									{/* Stats */}
									<div className="flex gap-6 text-center">
										<div>
											<div className="text-2xl font-bold">
												{participant.votes_cast}
											</div>
											<div className="text-xs text-muted-foreground">Votes</div>
										</div>
										<div>
											<div className="text-2xl font-bold">
												{participant.topics_created}
											</div>
											<div className="text-xs text-muted-foreground">
												Topics
											</div>
										</div>
										<div>
											<div className="text-2xl font-bold text-yellow-600">
												{participant.total_points}
											</div>
											<div className="text-xs text-muted-foreground flex items-center gap-1">
												<Trophy className="h-3 w-3" />
												Points
											</div>
										</div>
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
