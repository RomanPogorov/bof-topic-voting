import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "BOF TV Display",
	description: "Real-time BOF voting results for large screens",
};

export default function TVLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
			{children}
		</div>
	);
}
