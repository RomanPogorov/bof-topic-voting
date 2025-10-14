"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/constants/routes";
import {
	LayoutDashboard,
	Users,
	QrCode,
	Shield,
	BarChart3,
	Settings,
} from "lucide-react";

const navItems = [
	{
		label: "Dashboard",
		href: ROUTES.ADMIN,
		icon: LayoutDashboard,
	},
	{
		label: "Participants",
		href: ROUTES.ADMIN_PARTICIPANTS,
		icon: Users,
	},
	{
		label: "QR Codes",
		href: ROUTES.ADMIN_QR,
		icon: QrCode,
	},
	{
		label: "Moderation",
		href: ROUTES.ADMIN_MODERATION,
		icon: Shield,
	},
	{
		label: "Analytics",
		href: ROUTES.ADMIN_ANALYTICS,
		icon: BarChart3,
	},
];

export function AdminNav() {
	const pathname = usePathname();

	return (
		<nav className="border-b bg-white shadow-sm">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link href={ROUTES.ADMIN} className="flex items-center gap-2">
						<Settings className="h-6 w-6 text-primary" />
						<span className="text-xl font-bold">BOF Admin</span>
					</Link>

					{/* Navigation */}
					<div className="flex gap-1">
						{navItems.map((item) => {
							const Icon = item.icon;
							const isActive = pathname === item.href;

							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
										isActive
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:bg-muted hover:text-foreground",
									)}
								>
									<Icon className="h-4 w-4" />
									{item.label}
								</Link>
							);
						})}
					</div>

					{/* Mobile view link */}
					<Link
						href={ROUTES.HOME}
						className="text-sm text-muted-foreground hover:text-foreground"
					>
						← Back to App
					</Link>
				</div>
			</div>
		</nav>
	);
}
