"use client";

export const dynamic = "force-dynamic";

import { useBOFSessions } from "@/lib/hooks/useBOFSessions";
import { useAuth } from "@/lib/contexts/auth-context";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { BOFCard } from "@/components/mobile/bof-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

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

	// Group sessions by day
	const sessionsByDay = sessions.reduce(
		(acc, session) => {
			if (!acc[session.day_number]) {
				acc[session.day_number] = [];
			}
			acc[session.day_number].push(session);
			return acc;
		},
		{} as Record<number, typeof sessions>,
	);

	return (
		<div className="p-4 space-y-6 safe-top">
			{/* Header */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">BOF Sessions</h1>
						<p className="text-muted-foreground">Birds of a Feather Voting</p>
					</div>
					{participant && (
						<Badge
							variant="outline"
							className="gap-1 bg-primary/5 border-primary/20"
						>
							<Sparkles className="h-3 w-3" />
							Welcome
						</Badge>
					)}
				</div>

				{participant && (
					<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
						<CardContent className="p-4">
							<p className="font-medium">👋 Hi, {participant.name}!</p>
							<p className="text-sm text-muted-foreground mt-1">
								{participant.company
									? `from ${participant.company}`
									: "Ready to vote?"}
							</p>
						</CardContent>
					</Card>
				)}
			</div>

			{/* BOF Sessions by Day */}
			<div className="space-y-8">
				{[1, 2, 3].map((day) => (
					<div key={day} className="space-y-4">
						<div className="flex items-center gap-3">
							<div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
								{day}
							</div>
							<h2 className="text-xl font-bold">Day {day}</h2>
						</div>

						<div className="space-y-3">
							{sessionsByDay[day]?.map((session) => (
								<BOFCard key={session.id} session={session} />
							))}
							{!sessionsByDay[day] && (
								<Card className="border-dashed">
									<CardContent className="p-8 text-center text-muted-foreground">
										No sessions scheduled
									</CardContent>
								</Card>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
