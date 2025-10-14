import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface LoadingSpinnerProps {
	text?: string;
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
	text,
	className,
	size = "md",
}: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: "h-6 w-6",
		md: "h-12 w-12",
		lg: "h-16 w-16",
	};

	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center gap-4 py-8",
				className,
			)}
		>
			<Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
			{text && <p className="text-sm text-muted-foreground">{text}</p>}
		</div>
	);
}
