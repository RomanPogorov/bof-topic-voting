"use client";

import { BottomNav } from "@/components/mobile/bottom-nav";
import { AuthProvider } from "@/lib/contexts/auth-context";

export default function MobileLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AuthProvider>
			<div className="min-h-screen bg-background pb-20">
				<main className="max-w-2xl mx-auto">{children}</main>
				<BottomNav />
			</div>
		</AuthProvider>
	);
}
