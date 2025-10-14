import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
	title: "BOF Admin Panel",
	description: "Administrative panel for BOF Voting System",
};

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-slate-50">
			<AdminNav />
			<main className="container mx-auto py-8 px-4">{children}</main>
		</div>
	);
}
