"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, FileText, Trophy, User } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const tabs = [
	{
		href: ROUTES.HOME,
		icon: Calendar,
		label: "Calendar",
	},
	{
		href: ROUTES.MY_TOPICS,
		icon: FileText,
		label: "My Topics",
	},
	{
		href: ROUTES.LEADERBOARD,
		icon: Trophy,
		label: "Leaders",
	},
	{
		href: ROUTES.PROFILE,
		icon: User,
		label: "Profile",
	},
];

export function BottomNav() {
	const pathname = usePathname();

	return (
		<nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-bottom">
			<div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					const isActive = pathname === tab.href;

					return (
						<Link
							key={tab.href}
							href={tab.href}
							className={cn(
								"flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all touch-target",
								"active:scale-95",
								isActive
									? "text-primary"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<Icon
								className={cn(
									"h-5 w-5 transition-transform",
									isActive && "scale-110",
								)}
							/>
							<span className="text-xs font-medium">{tab.label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
