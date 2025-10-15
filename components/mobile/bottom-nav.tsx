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
	// {
	// 	href: ROUTES.LEADERBOARD,
	// 	icon: Trophy,
	// 	label: "Leaders",
	// },
	{
		href: ROUTES.PROFILE,
		icon: User,
		label: "Profile",
	},
];

export function BottomNav() {
	const pathname = usePathname();

	return (
		<nav className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[16px] z-50 safe-bottom">
			<div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					const isActive = pathname === tab.href;

					return (
						<Link
							key={tab.href}
							href={tab.href}
							className={cn(
								"flex flex-col items-center rounded-lg transition-all touch-target",
								"active:scale-95",
								isActive
									? "gap-[3px] pb-2 pt-[7px] px-3 text-[#ea4a35]"
									: "gap-1 px-3 py-2 text-zinc-500 hover:text-zinc-700",
							)}
						>
							<Icon
								className={cn(
									"transition-transform",
									isActive ? "h-[22px] w-[22px]" : "h-5 w-5",
								)}
							/>
							<span className="text-[12px] leading-[16px] font-medium">
								{tab.label}
							</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
