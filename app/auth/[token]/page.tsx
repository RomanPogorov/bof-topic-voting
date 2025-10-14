"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/auth.service";
import { ROUTES } from "@/lib/constants/routes";
import { ErrorCodes } from "@/lib/types";
import { Loader2, CheckCircle2, XCircle, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthPageProps {
	params: Promise<{ token: string }>;
}

export default function AuthPage({ params }: AuthPageProps) {
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [error, setError] = useState<string>("");
	const router = useRouter();

	useEffect(() => {
		async function authenticate() {
			try {
				const { token } = await params;
				setStatus("loading");

				const { participant } = await AuthService.verifyAndCreateSession(token);

				setStatus("success");

				// Redirect to home after 1 second
				setTimeout(() => {
					if (typeof window !== "undefined") {
						window.location.replace(ROUTES.HOME);
					} else {
						router.push(ROUTES.HOME);
					}
				}, 1000);
			} catch (err: any) {
				setStatus("error");

				// Set user-friendly error messages
				switch (err.message) {
					case ErrorCodes.INVALID_TOKEN:
						setError("Invalid QR code. Please contact the organizer.");
						break;
					case ErrorCodes.BLOCKED_USER:
						setError("Your account has been blocked. Please contact support.");
						break;
					default:
						setError("Authentication failed. Please try again.");
				}
			}
		}

		authenticate();
	}, [params, router]);

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardContent className="pt-12 pb-8">
					<div className="flex flex-col items-center text-center space-y-6">
						{/* Icon */}
						<div className="relative">
							{status === "loading" && (
								<div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
									<Loader2 className="w-12 h-12 text-primary animate-spin" />
								</div>
							)}

							{status === "success" && (
								<div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-300">
									<CheckCircle2 className="w-12 h-12 text-green-600" />
								</div>
							)}

							{status === "error" && (
								<div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center animate-in zoom-in duration-300">
									<XCircle className="w-12 h-12 text-red-600" />
								</div>
							)}
						</div>

						{/* Status Messages */}
						{status === "loading" && (
							<>
								<h1 className="text-2xl font-bold">Authenticating</h1>
								<p className="text-muted-foreground">
									Verifying your credentials...
								</p>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Shield className="w-4 h-4" />
									<span>Secure multi-device authentication</span>
								</div>
							</>
						)}

						{status === "success" && (
							<>
								<h1 className="text-2xl font-bold text-green-600">Welcome!</h1>
								<p className="text-muted-foreground">
									Authentication successful. Redirecting...
								</p>
							</>
						)}

						{status === "error" && (
							<>
								<h1 className="text-2xl font-bold text-red-600">
									Authentication Failed
								</h1>
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
								<Button
									onClick={() => router.push(ROUTES.HOME)}
									variant="outline"
									className="w-full"
								>
									Go to Home
								</Button>
							</>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
