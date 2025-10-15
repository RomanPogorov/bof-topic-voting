import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AppError } from "@/lib/types";
import { ErrorCodes } from "@/lib/types";

interface ErrorMessageProps {
	error: AppError | Error | string;
	onRetry?: () => void;
}

function getErrorMessage(error: AppError | Error | string): string {
	if (typeof error === "string") return error;

	if ("code" in error) {
		switch (error.code) {
			case ErrorCodes.INVALID_TOKEN:
				return "Invalid authentication token";
			case ErrorCodes.SESSION_EXPIRED:
				return "Your session has expired. Please sign in again.";
			case ErrorCodes.BLOCKED_USER:
				return "Your account has been blocked";
			case ErrorCodes.ALREADY_JOINED:
				return "You have already joined a topic in this session";
			case ErrorCodes.JOINING_CLOSED:
				return "Joining is closed for this session";
			case ErrorCodes.CANNOT_JOIN_OWN_TOPIC:
				return "You cannot join your own topic - you're leading it!";
			case ErrorCodes.ALREADY_CREATED_TOPIC:
				return "You have already created a topic for this session";
			case ErrorCodes.NETWORK_ERROR:
				return "Network error. Please check your connection.";
			case ErrorCodes.SERVER_ERROR:
				return "Server error. Please try again later.";
			default:
				return error.message || "An unexpected error occurred";
		}
	}

	return error.message || "An unexpected error occurred";
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
	return (
		<Alert variant="destructive" className="my-4">
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription className="mt-2 space-y-2">
				<p>{getErrorMessage(error)}</p>
				{onRetry && (
					<Button
						onClick={onRetry}
						variant="outline"
						size="sm"
						className="mt-2"
					>
						Try Again
					</Button>
				)}
			</AlertDescription>
		</Alert>
	);
}
