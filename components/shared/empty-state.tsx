import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
	icon?: string;
	title: string;
	description: string;
	action?: ReactNode;
	className?: string;
}

export function EmptyState({
	icon = "📭",
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center py-12 px-4 text-center",
				className,
			)}
		>
			<div className="text-6xl mb-4 animate-in fade-in zoom-in duration-500">
				{icon}
			</div>
			<h3 className="text-lg font-semibold mb-2">{title}</h3>
			<p className="text-sm text-muted-foreground max-w-md mb-6">
				{description}
			</p>
			{action}
		</div>
	);
}
