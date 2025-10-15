"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import type { Participant } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
	Search,
	User,
	Building2,
	Calendar,
	Trophy,
	QrCode,
	RefreshCw,
	Printer,
	Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import { QRModal } from "@/components/admin/qr-modal";
import { BulkQRModal } from "@/components/admin/bulk-qr-modal";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ParticipantWithStats extends Participant {
	votes_cast?: number;
	topics_created?: number;
	achievements_count?: number;
	total_points?: number;
}

export default function ParticipantsPage() {
	const [participants, setParticipants] = useState<ParticipantWithStats[]>([]);
	const [filteredParticipants, setFilteredParticipants] = useState<
		ParticipantWithStats[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedParticipant, setSelectedParticipant] =
		useState<ParticipantWithStats | null>(null);
	const [showQRModal, setShowQRModal] = useState(false);
	const [showBulkQRModal, setShowBulkQRModal] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
	const [participantToDelete, setParticipantToDelete] =
		useState<ParticipantWithStats | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const fetchParticipants = useCallback(async () => {
		try {
			setIsLoading(true);
			console.log("Fetching participants from API...");

			const response = await fetch("/api/admin/participants");
			if (!response.ok) {
				throw new Error("Failed to fetch participants");
			}

			const { participants } = await response.json();
			console.log("Received participants:", participants);
			setParticipants(participants);
			setFilteredParticipants(participants);
		} catch (err) {
			console.error("Error fetching participants:", err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchParticipants();
	}, [fetchParticipants]);

	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredParticipants(participants);
			return;
		}

		const query = searchQuery.toLowerCase();
		const filtered = participants.filter(
			(p) =>
				p.name.toLowerCase().includes(query) ||
				p.company?.toLowerCase().includes(query) ||
				p.email?.toLowerCase().includes(query),
		);
		setFilteredParticipants(filtered);
	}, [searchQuery, participants]);

	function showQRCode(participant: ParticipantWithStats) {
		setSelectedParticipant(participant);
		setShowQRModal(true);
	}

	function handleDeleteClick(participant: ParticipantWithStats) {
		setParticipantToDelete(participant);
		setShowDeleteDialog(true);
	}

	async function handleDeleteConfirm() {
		if (!participantToDelete) return;

		try {
			setIsDeleting(true);
			const response = await fetch(
				`/api/admin/participants?id=${participantToDelete.id}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				throw new Error("Failed to delete participant");
			}

			// Refresh the list
			await fetchParticipants();
			setShowDeleteDialog(false);
			setParticipantToDelete(null);
		} catch (err) {
			console.error("Error deleting participant:", err);
			alert("Failed to delete participant. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	}

	async function handleDeleteAllConfirm() {
		try {
			setIsDeleting(true);
			const response = await fetch("/api/admin/participants?all=true", {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete all participants");
			}

			// Refresh the list
			await fetchParticipants();
			setShowDeleteAllDialog(false);
		} catch (err) {
			console.error("Error deleting all participants:", err);
			alert("Failed to delete all participants. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-4xl font-bold">Participants</h1>
					<p className="text-muted-foreground mt-2">
						View and manage registered participants
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={() => setShowBulkQRModal(true)}
						className="flex items-center gap-2"
					>
						<Printer className="h-4 w-4" />
						Печать всех QR-кодов
					</Button>
					<Button
						onClick={() => setShowDeleteAllDialog(true)}
						variant="destructive"
						disabled={participants.length === 0}
					>
						<Trash2 className="h-4 w-4 mr-2" />
						Удалить всех
					</Button>
					<Button onClick={fetchParticipants} variant="outline">
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh
					</Button>
				</div>
			</div>

			{/* Search */}
			<Card>
				<CardContent className="pt-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by name, company, or email..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardContent className="pt-6">
						<div className="text-3xl font-bold">{participants.length}</div>
						<div className="text-sm text-muted-foreground">
							Total Participants
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-3xl font-bold">
							{participants.reduce((sum, p) => sum + (p.votes_cast || 0), 0)}
						</div>
						<div className="text-sm text-muted-foreground">
							Total Votes Cast
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-3xl font-bold">
							{participants.reduce(
								(sum, p) => sum + (p.topics_created || 0),
								0,
							)}
						</div>
						<div className="text-sm text-muted-foreground">
							Total Topics Created
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Participants List */}
			{isLoading ? (
				<LoadingSpinner text="Loading participants..." className="py-20" />
			) : filteredParticipants.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center text-muted-foreground">
						{searchQuery
							? "No participants found matching your search"
							: "No participants registered yet"}
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{filteredParticipants.map((participant) => (
						<Card key={participant.id}>
							<CardContent className="pt-6">
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<User className="h-5 w-5 text-muted-foreground" />
											<h3 className="text-lg font-semibold">
												{participant.name}
											</h3>
										</div>

										<div className="space-y-1 text-sm text-muted-foreground">
											{participant.company && (
												<div className="flex items-center gap-2">
													<Building2 className="h-4 w-4" />
													<span>{participant.company}</span>
												</div>
											)}
											{participant.email && (
												<div className="flex items-center gap-2">
													<span>📧</span>
													<span>{participant.email}</span>
												</div>
											)}
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4" />
												<span>
													Registered {formatDate(participant.created_at, "PPp")}
												</span>
											</div>
										</div>
									</div>

									{/* Actions & Stats */}
									<div className="flex items-center gap-4">
										{/* Show QR Button */}
										<Button
											variant="outline"
											size="sm"
											onClick={() => showQRCode(participant)}
											className="flex items-center gap-2"
										>
											<QrCode className="h-4 w-4" />
											Показать QR
										</Button>

										{/* Delete Button */}
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDeleteClick(participant)}
											className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
										>
											<Trash2 className="h-4 w-4" />
										</Button>

										{/* Stats */}
										<div className="flex gap-6 text-center">
											<div>
												<div className="text-2xl font-bold">
													{participant.votes_cast}
												</div>
												<div className="text-xs text-muted-foreground">
													Votes
												</div>
											</div>
											<div>
												<div className="text-2xl font-bold">
													{participant.topics_created}
												</div>
												<div className="text-xs text-muted-foreground">
													Topics
												</div>
											</div>
											<div>
												<div className="text-2xl font-bold text-yellow-600">
													{participant.total_points}
												</div>
												<div className="text-xs text-muted-foreground flex items-center gap-1">
													<Trophy className="h-3 w-3" />
													Points
												</div>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* QR Modal */}
			{selectedParticipant && (
				<QRModal
					isOpen={showQRModal}
					onClose={() => {
						setShowQRModal(false);
						setSelectedParticipant(null);
					}}
					participant={{
						id: selectedParticipant.id,
						name: selectedParticipant.name,
						email: selectedParticipant.email,
						auth_token: selectedParticipant.auth_token,
					}}
				/>
			)}

			{/* Bulk QR Modal */}
			<BulkQRModal
				isOpen={showBulkQRModal}
				onClose={() => setShowBulkQRModal(false)}
				participants={participants}
			/>

			{/* Delete Participant Dialog */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Удалить участника?</AlertDialogTitle>
						<AlertDialogDescription>
							Вы действительно хотите удалить участника{" "}
							<strong>{participantToDelete?.name}</strong>? Это действие нельзя
							отменить. Все данные участника, включая голоса и топики, будут
							удалены.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							disabled={isDeleting}
							className="bg-red-600 hover:bg-red-700"
						>
							{isDeleting ? "Удаление..." : "Удалить"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete All Participants Dialog */}
			<AlertDialog
				open={showDeleteAllDialog}
				onOpenChange={setShowDeleteAllDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Удалить всех участников?</AlertDialogTitle>
						<AlertDialogDescription>
							Вы действительно хотите удалить ВСЕХ {participants.length}{" "}
							участников? Это действие нельзя отменить. Все данные всех
							участников, включая голоса и топики, будут удалены безвозвратно.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteAllConfirm}
							disabled={isDeleting}
							className="bg-red-600 hover:bg-red-700"
						>
							{isDeleting ? "Удаление..." : "Удалить всех"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
