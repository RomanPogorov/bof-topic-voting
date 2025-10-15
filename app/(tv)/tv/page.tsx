"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { BOFSession } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Calendar, Clock, Tv } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";

export default function TVSelectPage() {
	const [sessions, setSessions] = useState<BOFSession[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchSessions() {
			try {
				const { data, error } = await supabase
					.from("bof_sessions")
					.select("*")
					.order("day_number", { ascending: true })
					.order("session_time", { ascending: true });

				if (error) throw error;
				setSessions(data || []);
			} catch (err) {
				console.error("Error fetching sessions:", err);
			} finally {
				setIsLoading(false);
			}
		}

		fetchSessions();
	}, []);

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<LoadingSpinner text="Loading sessions..." className="text-white" />
			</div>
		);
	}

	const sessionsByDay = sessions.reduce(
		(acc, session) => {
			if (!acc[session.day_number]) {
				acc[session.day_number] = [];
			}
			acc[session.day_number].push(session);
			return acc;
		},
		{} as Record<number, BOFSession[]>,
	);

	return (
		<div className="min-h-screen p-12">
			{/* Header */}
			<div className="mb-12 text-center">
				<div className="mb-6 flex items-center justify-center gap-3">
					<Tv className="h-12 w-12 text-blue-400" />
				</div>
				<h1 className="text-6xl font-bold text-white mb-4">BOF TV Display</h1>
				<p className="text-xl text-slate-300">
					Select a session to display on large screen
				</p>
			</div>

			{/* Sessions Grid */}
			<div className="max-w-6xl mx-auto space-y-12">
				{[1, 2, 3].map((day) => (
					<div key={day}>
						<div className="mb-6 flex items-center gap-4">
							<div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-500/50">
								{day}
							</div>
							<h2 className="text-4xl font-bold text-white">Day {day}</h2>
						</div>

						<div className="grid grid-cols-2 gap-6">
							{sessionsByDay[day]?.map((session) => (
								<Link
									key={session.id}
									href={`/tv/${session.id}`}
									className="group"
								>
									<div className="relative overflow-hidden rounded-2xl bg-slate-800/50 p-8 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
										{/* Content */}
										<div className="mb-4">
											<div className="mb-2 text-sm text-slate-400">
												Session {session.session_number}
											</div>
											<h3 className="text-2xl font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
												{session.title}
											</h3>
											{session.description && (
												<p className="text-slate-300 line-clamp-2">
													{session.description}
												</p>
											)}
										</div>

										{/* Info */}
										<div className="space-y-2 text-sm text-slate-400">
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4" />
												<span>{formatDate(session.session_time, "PPP")}</span>
											</div>
											<div className="flex items-center gap-2">
												<Clock className="h-4 w-4" />
												<span>{formatDate(session.session_time, "p")}</span>
											</div>
										</div>

										{/* Hover Effect */}
										<div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
									</div>
								</Link>
							))}

							{!sessionsByDay[day] && (
								<div className="col-span-2 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/30 p-12 text-center">
									<p className="text-xl text-slate-500">
										No sessions scheduled
									</p>
								</div>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Footer */}
			<div className="mt-16 text-center">
				<p className="text-slate-500">
					Birds of a Feather Voting System · Conference 2025
				</p>
			</div>
		</div>
	);
}
