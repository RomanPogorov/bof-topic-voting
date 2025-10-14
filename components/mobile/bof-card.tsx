import Link from "next/link";
import { BOFSession, BOFStatus } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/formatters";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/constants/routes";

interface BOFCardProps {
	session: BOFSession;
}

function getStatusBadge(status: BOFStatus) {
	switch (status) {
		case BOFStatus.VOTING_OPEN:
			return (
				<Badge className="bg-green-500 hover:bg-green-600">🗳️ Voting Open</Badge>
			);
		case BOFStatus.VOTING_CLOSED:
			return (
				<Badge className="bg-orange-500 hover:bg-orange-600">
					🔒 Voting Closed
				</Badge>
			);
		case BOFStatus.COMPLETED:
			return (
				<Badge variant="secondary" className="bg-gray-500 hover:bg-gray-600">
					✓ Completed
				</Badge>
			);
		default:
			return <Badge variant="outline">⏳ Upcoming</Badge>;
	}
}

export function BOFCard({ session }: BOFCardProps) {
	const isActive = session.status === BOFStatus.VOTING_OPEN;

	return (
		<Link href={ROUTES.BOF(session.id)}>
			<Card
				className={cn(
					"transition-all hover:shadow-lg active:scale-[0.98]",
					isActive && "ring-2 ring-primary",
				)}
			>
				<CardContent className="p-5">
					<div className="flex items-start justify-between gap-3 mb-3">
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
							<h3 className="font-semibold text-lg leading-tight">
								{session.title}
							</h3>
						</div>
						{getStatusBadge(session.status)}
					</div>

					{session.description && (
						<p className="text-sm text-muted-foreground mb-4 line-clamp-2">
							{session.description}
						</p>
					)}

					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Calendar className="h-4 w-4" />
							<span>{formatDate(session.session_time, "PPP")}</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<Clock className="h-4 w-4" />
							<span>{formatDate(session.session_time, "p")}</span>
						</div>
					</div>

					{session.voting_opens_at && session.voting_closes_at && (
						<div className="mt-4 pt-4 border-t border-border">
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span>
									Voting: {formatDate(session.voting_opens_at, "p")} -{" "}
									{formatDate(session.voting_closes_at, "p")}
								</span>
								<ChevronRight className="h-4 w-4" />
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</Link>
	);
}
