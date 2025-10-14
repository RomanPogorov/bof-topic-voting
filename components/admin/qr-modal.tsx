"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QRModalProps {
	isOpen: boolean;
	onClose: () => void;
	participant: {
		id: string;
		name: string;
		email?: string;
		auth_token?: string;
	};
}

export function QRModal({ isOpen, onClose, participant }: QRModalProps) {
	const [qrUrl, setQrUrl] = useState("");
	const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
	const [isGeneratingQR, setIsGeneratingQR] = useState(false);

	// Генерируем URL при открытии модалки
	useEffect(() => {
		if (isOpen && participant.auth_token) {
			const url = `${window.location.origin}/auth/${participant.auth_token}`;
			setQrUrl(url);
			generateQRCode(url);
		}
	}, [isOpen, participant.auth_token]);

	const generateQRCode = async (url: string) => {
		setIsGeneratingQR(true);
		try {
			// Используем QR Server API для генерации QR кода
			const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
			setQrCodeDataUrl(qrApiUrl);
		} catch (err) {
			console.error("Error generating QR code:", err);
			toast.error("Ошибка при генерации QR кода");
		} finally {
			setIsGeneratingQR(false);
		}
	};

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(qrUrl);
			toast.success("QR ссылка скопирована в буфер обмена");
		} catch (err) {
			toast.error("Не удалось скопировать ссылку");
		}
	};

	const downloadQR = () => {
		if (qrCodeDataUrl) {
			const link = document.createElement("a");
			link.href = qrCodeDataUrl;
			link.download = `qr-${participant.name.replace(/\s+/g, "-")}.png`;
			link.click();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<QrCode className="h-5 w-5" />
						QR код для {participant.name}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* QR Code Display */}
					<div className="flex justify-center">
						<div className="bg-white p-4 rounded-lg border-2 border-gray-200">
							{isGeneratingQR ? (
								<div className="w-48 h-48 bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
									<div className="text-center text-gray-500">
										<Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
										<p className="text-sm">Генерируем QR код...</p>
									</div>
								</div>
							) : qrCodeDataUrl ? (
								<Image
									src={qrCodeDataUrl}
									alt="QR Code"
									width={192}
									height={192}
									className="w-48 h-48 rounded"
								/>
							) : (
								<div className="w-48 h-48 bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
									<div className="text-center text-gray-500">
										<QrCode className="h-12 w-12 mx-auto mb-2" />
										<p className="text-sm">QR код</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* URL Display */}
					<div className="space-y-2">
						<label
							htmlFor="qr-url"
							className="text-sm font-medium text-gray-700"
						>
							Ссылка для входа:
						</label>
						<div className="flex items-center gap-2">
							<input
								id="qr-url"
								type="text"
								value={qrUrl}
								readOnly
								className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
							/>
							<Button
								size="sm"
								variant="outline"
								onClick={copyToClipboard}
								className="flex items-center gap-1"
							>
								<Copy className="h-4 w-4" />
								Копировать
							</Button>
						</div>
					</div>

					{/* Participant Info */}
					<div className="bg-gray-50 p-3 rounded-md">
						<h4 className="font-medium text-sm text-gray-900 mb-1">
							Информация об участнике:
						</h4>
						<p className="text-sm text-gray-600">
							<strong>Имя:</strong> {participant.name}
						</p>
						{participant.email && (
							<p className="text-sm text-gray-600">
								<strong>Email:</strong> {participant.email}
							</p>
						)}
						<p className="text-sm text-gray-600">
							<strong>ID:</strong> {participant.id}
						</p>
					</div>

					{/* Actions */}
					<div className="flex gap-2 pt-2">
						<Button
							variant="outline"
							onClick={downloadQR}
							disabled={!qrCodeDataUrl}
							className="flex items-center gap-1"
						>
							<Download className="h-4 w-4" />
							Скачать QR
						</Button>
						<Button onClick={onClose} className="flex-1">
							Закрыть
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
