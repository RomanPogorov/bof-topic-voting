"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Printer, Loader2 } from "lucide-react";
import type { Participant } from "@/lib/types";

interface BulkQRModalProps {
	isOpen: boolean;
	onClose: () => void;
	participants: Participant[];
}

interface QRCodeData {
	participant: Participant;
	qrUrl: string;
	qrCodeDataUrl: string;
}

export function BulkQRModal({
	isOpen,
	onClose,
	participants,
}: BulkQRModalProps) {
	const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedCount, setGeneratedCount] = useState(0);

	const generateAllQRCodes = useCallback(async () => {
		setIsGenerating(true);
		setGeneratedCount(0);
		const qrCodesData: QRCodeData[] = [];

		for (const participant of participants) {
			if (participant.auth_token) {
				const url = `${window.location.origin}/auth/${participant.auth_token}`;
				const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;

				qrCodesData.push({
					participant,
					qrUrl: url,
					qrCodeDataUrl: qrApiUrl,
				});
				setGeneratedCount(qrCodesData.length);
			}
		}

		setQrCodes(qrCodesData);
		setIsGenerating(false);
	}, [participants]);

	// Генерируем QR коды для всех участников
	useEffect(() => {
		if (isOpen && participants.length > 0) {
			generateAllQRCodes();
		}
	}, [isOpen, participants, generateAllQRCodes]);

	const handlePrint = () => {
		// Создаем скрытый div с содержимым для печати
		const printContent = document.createElement("div");
		printContent.className = "printable-area";
		printContent.innerHTML = `
			<div style="text-align: center; margin-bottom: 20px;">
				<h1>QR-коды участников BOF</h1>
				<p>Всего участников: ${participants.length}</p>
			</div>
			<div style="display: flex; flex-wrap: wrap; gap: 20px;">
				${qrCodes
					.map(
						(qrData) => `
					<div class="qr-card" style="width: 45%; margin-bottom: 20px; border: 1px solid #000; padding: 15px; text-align: center;">
						<img src="${qrData.qrCodeDataUrl}" alt="QR код" class="qr-image" style="width: 120px; height: 120px; margin: 0 auto 10px; display: block;" />
						<div class="participant-name" style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">${qrData.participant.name}</div>
						${qrData.participant.email ? `<div class="participant-email" style="font-size: 12px; color: #666;">${qrData.participant.email}</div>` : ""}
					</div>
				`,
					)
					.join("")}
			</div>
		`;

		// Временно добавляем в DOM
		document.body.appendChild(printContent);

		// Печатаем
		window.print();

		// Удаляем после печати
		document.body.removeChild(printContent);
	};

	return (
		<>
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<QrCode className="h-5 w-5" />
							QR-коды всех участников ({participants.length})
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						{isGenerating ? (
							<div className="text-center py-8">
								<Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
								<p>
									Генерируем QR-коды... {generatedCount}/{participants.length}
								</p>
							</div>
						) : (
							<>
								<div className="flex justify-between items-center mb-4">
									<p className="text-sm text-muted-foreground">
										Всего участников: {participants.length}
									</p>
									<Button
										onClick={handlePrint}
										className="flex items-center gap-2"
									>
										<Printer className="h-4 w-4" />
										Печать
									</Button>
								</div>

								{/* QR Codes Grid */}
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
									{qrCodes.map((qrData) => (
										<div
											key={qrData.participant.id}
											className="border rounded-lg p-4 text-center"
										>
											<div className="mb-3">
												<Image
													src={qrData.qrCodeDataUrl}
													alt={`QR код для ${qrData.participant.name}`}
													width={150}
													height={150}
													className="mx-auto"
												/>
											</div>
											<div className="space-y-1">
												<h4 className="font-semibold text-sm">
													{qrData.participant.name}
												</h4>
												{qrData.participant.email && (
													<p className="text-xs text-muted-foreground">
														{qrData.participant.email}
													</p>
												)}
											</div>
										</div>
									))}
								</div>
							</>
						)}

						<div className="flex justify-end pt-4 border-t">
							<Button onClick={onClose} variant="outline">
								Закрыть
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Print Styles */}
			<style jsx global>{`
				@media print {
					body * {
						visibility: hidden;
					}
					.printable-area, .printable-area * {
						visibility: visible;
					}
					.printable-area {
						position: absolute;
						left: 0;
						top: 0;
						width: 100%;
					}
					.qr-card {
						page-break-inside: avoid;
						margin-bottom: 20px;
						border: 1px solid #000;
						padding: 15px;
						width: 45%;
						display: inline-block;
						margin-right: 10px;
						vertical-align: top;
						text-align: center;
					}
					.qr-image {
						width: 120px;
						height: 120px;
						margin: 0 auto 10px;
						display: block;
					}
					.participant-name {
						font-weight: bold;
						font-size: 14px;
						margin-bottom: 5px;
					}
					.participant-email {
						font-size: 12px;
						color: #666;
					}
					@page {
						margin: 1cm;
						size: A4;
					}
				}
			`}</style>
		</>
	);
}
