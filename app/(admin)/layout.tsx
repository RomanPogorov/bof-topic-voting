"use client";

import { AdminNav } from "@/components/admin/admin-nav";
import { useAuth } from "@/lib/contexts/auth-context";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { useEffect } from "react";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { participant, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isLoading) {
			return; // Wait until auth state is determined
		}

		if (!participant) {
			// Not logged in, redirect to home
			router.replace(ROUTES.HOME);
		} else if (participant.role !== "admin") {
			// Logged in, but not an admin, show access denied
			router.replace(ROUTES.ACCESS_DENIED); // Or a specific "access denied" page
		}
	}, [participant, isLoading, router]);

	// Render a loading state while checking auth
	if (isLoading || !participant || participant.role !== "admin") {
		return (
			<div className="flex h-screen items-center justify-center">
				<LoadingSpinner text="Verifying access..." />
			</div>
		);
	}

	// Render the admin layout if authorized
	return (
		<div className="flex min-h-screen flex-col bg-gray-50">
			<AdminNav />
			<main className="flex-1 p-6">{children}</main>
		</div>
	);
}
