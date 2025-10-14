import Link from "next/link";
import type { BOFSession } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/formatters";
import { Calendar, Clock } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";

interface BOFCardProps {
	session: BOFSession;
}

export function BOFCard({ session }: BOFCardProps) {
	return (
		<Link href={ROUTES.BOF(session.id)}>
			<Card className="transition-all hover:shadow-lg active:scale-[0.98]">
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
				</CardContent>
			</Card>
		</Link>
	);
}
