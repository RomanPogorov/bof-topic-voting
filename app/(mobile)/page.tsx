"use client";

export const dynamic = "force-dynamic";

import { useBOFSessions } from "@/lib/hooks/useBOFSessions";
import { useAuth } from "@/lib/contexts/auth-context";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { BOFCard } from "@/components/mobile/bof-card";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/formatters";
import Image from "next/image";

export default function HomePage() {
	const { participant, isLoading: authLoading } = useAuth();
	const { sessions, isLoading, error } = useBOFSessions();

	if (authLoading || isLoading) {
		return <LoadingSpinner text="Loading BOF sessions..." className="py-20" />;
	}

	if (error) {
		return (
			<div className="p-4">
				<ErrorMessage error={error} />
			</div>
		);
	}

	// Group sessions by date
	const sessionsByDate = sessions.reduce(
		(acc, session) => {
			const dateKey = formatDate(session.session_time, "MMM, d");
			if (!acc[dateKey]) {
				acc[dateKey] = [];
			}
			acc[dateKey].push(session);
			return acc;
		},
		{} as Record<string, typeof sessions>,
	);

	// Sort sessions within each date by session_time
	Object.keys(sessionsByDate).forEach((dateKey) => {
		sessionsByDate[dateKey].sort(
			(a, b) =>
				new Date(a.session_time).getTime() - new Date(b.session_time).getTime(),
		);
	});

	return (
		<div className="bg-[#f5f5f6] min-h-screen pb-4 px-4">
			<div className="flex flex-col gap-6">
				{/* Header */}
				<div className="flex items-center pb-4 pt-12">
					<div className="flex-1 flex flex-col">
						<h1 className="font-bold text-[30px] leading-[36px] text-zinc-950">
							BOF Sessions
						</h1>
						<p className="font-medium text-[16px] leading-[24px] text-[#ea4a35]">
							by Health Samurai
						</p>
					</div>
					<div className="w-[60px] h-[60px] relative shrink-0">
						<Image
							src="/hs-logo.svg"
							alt="Health Samurai"
							width={60}
							height={60}
							className="w-full h-full"
						/>
					</div>
				</div>

				{/* Welcome Card */}
				{participant && (
					<Card className="bg-white rounded-[16px] shadow-none border-none">
						<CardContent className="px-4 py-2 flex flex-col gap-1 text-center">
							<p className="font-medium text-[20px] leading-[24px] text-zinc-950">
								Hi and welcome,{" "}
								<span className="font-bold text-zinc-900">
									{participant.name}!
								</span>
							</p>
							<p className="font-normal text-[16px] leading-[20px] text-zinc-500">
								It's time to vote!
							</p>
						</CardContent>
					</Card>
				)}
			</div>

			{/* BOF Sessions by Date */}
			<div className="pt-4 flex flex-col gap-8">
				{Object.entries(sessionsByDate).map(([date, dateSessions]) => (
					<div key={date} className="flex flex-col gap-4">
						<div className="flex items-center justify-center">
							<div className="bg-zinc-900 rounded-full px-3 py-2">
								<p className="font-bold text-[19px] leading-[20px] text-neutral-50">
									{date}
								</p>
							</div>
						</div>

						<div className="flex flex-col gap-8">
							{dateSessions.map((session) => (
								<div key={session.id}>
									<BOFCard session={session} />
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
