"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, RefreshCw } from "lucide-react";
import { CreateTopicSheet } from "@/components/mobile/create-topic-sheet";
import { useAuth } from "@/lib/contexts/auth-context";
import { toast } from "sonner";

interface BOFSessionRow {
	id: string;
	day_number: number;
	session_number: number;
	title: string;
	description?: string;
}

export default function AdminBOFSessionsPage() {
	const [sessions, setSessions] = useState<BOFSessionRow[]>([]);
	const [loading, setLoading] = useState(true);
	const { participant } = useAuth();

	async function load() {
		setLoading(true);
		const { data } = await supabase
			.from("bof_sessions")
			.select("id, day_number, session_number, title, description")
			.order("day_number")
			.order("session_number");
		setSessions(data || []);
		setLoading(false);
	}

	useEffect(() => {
		load();
	}, []);

	async function addSession() {
		const now = new Date();
		const payload = {
			day_number: 1,
			session_number: sessions.filter((s) => s.day_number === 1).length + 1,
			title: "New BOF Session",
			description: "",
			session_time: now.toISOString(),
			voting_opens_at: now.toISOString(),
			voting_closes_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
			status: "voting_open",
		} as any;
		const { error } = await supabase.from("bof_sessions").insert(payload);
		if (error) {
			toast.error("Failed to add session");
		} else {
			toast.success("Session created");
			load();
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">BOF Sessions (Admin)</h1>
				<div className="flex gap-2">
					<Button variant="outline" onClick={load}>
						<RefreshCw className="h-4 w-4 mr-2" /> Refresh
					</Button>
					<Button onClick={addSession}>
						<Plus className="h-4 w-4 mr-2" /> New Session (Open)
					</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{sessions.map((s) => (
					<Card key={s.id}>
						<CardHeader>
							<CardTitle>
								Day {s.day_number} · Session {s.session_number}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="font-semibold">{s.title}</div>
							{s.description && (
								<div className="text-sm text-muted-foreground">
									{s.description}
								</div>
							)}

							{/* Admin can create topic into any session */}
							{participant && (
								<CreateTopicSheet
									bofId={s.id}
									participantId={participant.id}
									onTopicCreated={load}
								/>
							)}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
