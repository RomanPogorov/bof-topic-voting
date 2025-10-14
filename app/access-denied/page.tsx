"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccessDeniedPage() {
	const router = useRouter();

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
			<Card className="max-w-md w-full">
				<CardContent className="p-8 text-center space-y-4">
					<div className="flex justify-center">
						<ShieldAlert className="h-16 w-16 text-destructive" />
					</div>
					<h1 className="text-2xl font-bold">Access Denied</h1>
					<p className="text-muted-foreground">
						You do not have permission to view this page. Please contact an
						administrator if you believe this is an error.
					</p>
					<div className="flex gap-3 justify-center pt-4">
						<Button variant="outline" onClick={() => router.back()}>
							Go Back
						</Button>
						<Link href={ROUTES.HOME}>
							<Button>Go to Homepage</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
