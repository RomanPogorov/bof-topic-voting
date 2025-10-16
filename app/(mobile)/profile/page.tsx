"use client";

export const dynamic = "force-dynamic";

import { useAuth } from "@/lib/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getInitials } from "@/lib/utils/formatters";
import { LogOut, AlertCircle } from "lucide-react";

export default function ProfilePage() {
	const { participant, logout } = useAuth();

	if (!participant) {
		return (
			<div className="p-4 py-8">
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Please scan your QR code to view your profile
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="p-4 space-y-6 pb-6 safe-top">
			{/* Header */}
			<div className="text-center pt-4">
				<h1 className="text-2xl font-bold">Profile</h1>
			</div>

			{/* User Info Card */}
			<Card>
				<CardContent className="p-6 space-y-6">
					<div className="flex flex-col items-center text-center space-y-3">
						<Avatar className="h-20 w-20">
							<AvatarFallback className="text-2xl bg-primary/10">
								{getInitials(participant.name)}
							</AvatarFallback>
						</Avatar>
						<div>
							<h2 className="text-xl font-bold">{participant.name}</h2>
							{participant.company && (
								<p className="text-muted-foreground">{participant.company}</p>
							)}
							<p className="text-sm text-muted-foreground mt-1">
								{participant.email}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Logout Button */}
			<Button
				variant="outline"
				className="w-full touch-target"
				onClick={logout}
			>
				<LogOut className="h-4 w-4 mr-2" />
				Logout
			</Button>
		</div>
	);
}
