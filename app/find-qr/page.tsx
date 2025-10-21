"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { Search } from "lucide-react";
import Image from "next/image";

interface Participant {
	id: string;
	name: string;
	auth_token: string;
}

export default function FindQRPage() {
	const router = useRouter();
	const [participants, setParticipants] = useState<Participant[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		async function fetchParticipants() {
			try {
				const response = await fetch("/api/participants/public");
				if (!response.ok) {
					throw new Error("Failed to load participants");
				}
				const data = await response.json();
				setParticipants(data.participants || []);
			} catch (err) {
				setError((err as Error).message);
			} finally {
				setIsLoading(false);
			}
		}

		fetchParticipants();
	}, []);

	const filteredParticipants = useMemo(() => {
		if (!searchQuery.trim()) {
			return participants;
		}

		const query = searchQuery.toLowerCase().trim();
		return participants.filter((participant) =>
			participant.name.toLowerCase().includes(query),
		);
	}, [participants, searchQuery]);

	const handleLogin = (authToken: string) => {
		router.push(`/auth/${authToken}`);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-[#e7e7e9] flex items-center justify-center">
				<LoadingSpinner text="Loading participants..." />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-[#e7e7e9] flex items-center justify-center p-4">
				<ErrorMessage error={error} />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#e7e7e9]">
			<div className="max-w-2xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="flex items-center justify-between pb-8">
					<div className="flex-1">
						<h1 className="font-bold text-[30px] leading-[36px] text-zinc-950">
							Find Your Account
						</h1>
						<p className="font-normal text-[16px] leading-[24px] text-zinc-600 mt-2">
							Search for your name to login
						</p>
					</div>
					<div className="w-[60px] h-[60px] relative shrink-0">
						<Image
							src="/hs-logo.svg"
							alt="Health Samurai"
							width={60}
							height={60}
							className="w-full h-full"
						/>
					</div>
				</div>

				{/* Search Bar */}
				<div className="mb-6">
					<div className="relative">
						<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-zinc-400" />
						<input
							type="text"
							placeholder="Search by name..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full h-[52px] pl-12 pr-4 rounded-[12px] bg-white border-none shadow-sm text-[16px] leading-[24px] text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2378e1]"
						/>
					</div>
				</div>

				{/* Results count */}
				{searchQuery && (
					<p className="text-[14px] leading-[20px] text-zinc-600 mb-4">
						Found {filteredParticipants.length} participant
						{filteredParticipants.length !== 1 ? "s" : ""}
					</p>
				)}

				{/* Participants List */}
				<div className="flex flex-col gap-3">
					{filteredParticipants.length === 0 ? (
						<div className="bg-white rounded-[16px] p-8 text-center">
							<p className="text-[16px] leading-[24px] text-zinc-500">
								{searchQuery
									? "No participants found. Try a different search."
									: "No participants available."}
							</p>
						</div>
					) : (
						filteredParticipants.map((participant) => (
							<div
								key={participant.id}
								className="bg-white rounded-[12px] p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
							>
								<div className="flex-1 min-w-0">
									<p className="font-medium text-[16px] leading-[24px] text-zinc-950 truncate">
										{participant.name}
									</p>
								</div>
								<button
									type="button"
									onClick={() => handleLogin(participant.auth_token)}
									className="bg-[#2378e1] hover:bg-[#2378e1]/90 text-white font-medium text-[14px] leading-[20px] px-6 py-2.5 rounded-[8px] transition-colors shrink-0"
								>
									Login
								</button>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}

