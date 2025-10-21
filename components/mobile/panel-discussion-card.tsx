"use client";

import { Clock } from "lucide-react";

interface PanelDiscussionCardProps {
	title: string;
	time: string;
	participants: string[];
}

export function PanelDiscussionCard({
	title,
	time,
	participants,
}: PanelDiscussionCardProps) {
	return (
		<div className="bg-white/55 rounded-[16px] p-[16px] flex flex-col gap-[16px]">
			{/* Header */}
			<div className="flex items-center justify-between w-full">
				<h2 className="font-bold text-[20px] leading-[28px] text-zinc-950">
					Panel Discussion
				</h2>
				<div className="flex items-center gap-[6px]">
					<Clock className="size-[16px] text-zinc-500" />
					<span className="font-normal text-[14px] leading-[20px] text-zinc-500">
						{time}
					</span>
				</div>
			</div>

			{/* Title */}
			<div className="w-full">
				<h3 className="font-semibold text-[16px] leading-[22px] text-zinc-950">
					{title}
				</h3>
			</div>

			{/* Moderators label */}
			<div className="w-full">
				<p className="font-normal text-[13px] leading-[18px] text-zinc-500">
					Moderators
				</p>
			</div>

			{/* Participants */}
			<div className="flex flex-wrap gap-[8px]">
				{participants.map((participant) => (
					<div
						key={participant}
						className="bg-white px-[8px] py-[4px] rounded-full h-[25px] inline-flex items-center"
					>
						<span className="font-normal text-[13px] leading-[16.5px] text-[#52525b]">
							{participant}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
