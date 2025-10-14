"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateAuthToken } from "@/lib/services/qr.service";
import { supabase } from "@/lib/supabase/client";
import { QrCode, Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import QRCodeLib from "qrcode";

export default function GenerateQRPage() {
	const [name, setName] = useState("");
	const [company, setCompany] = useState("");
	const [qrData, setQrData] = useState<{
		token: string;
		url: string;
		qrCodeDataUrl: string;
	} | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [copied, setCopied] = useState(false);

	async function handleGenerate() {
		if (!name.trim()) {
			toast.error("Please enter participant name");
			return;
		}

		setIsGenerating(true);
		try {
			// 1) Generate token
			const token = await generateAuthToken();

			// 2) Create participant in Supabase with this token
			const { error: insertError } = await supabase
				.from("participants")
				.insert({
					name,
					company: company || null,
					email: `${token}@qr.local`,
					auth_token: token,
				});
			if (insertError) {
				throw insertError;
			}

			// 3) Build public auth URL for the current deployment
			const url = `${window.location.origin}/auth/${token}`;

			// Generate QR code
			const qrCodeDataUrl = await QRCodeLib.toDataURL(url, {
				width: 512,
				margin: 2,
				color: {
					dark: "#000000",
					light: "#FFFFFF",
				},
			});

			setQrData({ token, url, qrCodeDataUrl });
			toast.success("QR Code generated successfully!");
		} catch {
			toast.error("Failed to generate QR code");
		} finally {
			setIsGenerating(false);
		}
	}

	async function handleCopyUrl() {
		if (!qrData) return;

		try {
			await navigator.clipboard.writeText(qrData.url);
			setCopied(true);
			toast.success("URL copied to clipboard!");
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			toast.error("Failed to copy URL");
		}
	}

	function handleDownloadQR() {
		if (!qrData) return;

		const link = document.createElement("a");
		link.download = `qr-${name.replace(/\s+/g, "-").toLowerCase()}.png`;
		link.href = qrData.qrCodeDataUrl;
		link.click();
		toast.success("QR Code downloaded!");
	}

	function handleReset() {
		setName("");
		setCompany("");
		setQrData(null);
		setCopied(false);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-4xl font-bold">Generate QR Codes</h1>
				<p className="text-muted-foreground mt-2">
					Create participant access QR codes for registration
				</p>
			</div>

			<div className="grid gap-8 md:grid-cols-2">
				{/* Form */}
				<Card>
					<CardHeader>
						<CardTitle>Participant Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name *</Label>
							<Input
								id="name"
								placeholder="Enter participant name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								disabled={!!qrData}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="company">Company (optional)</Label>
							<Input
								id="company"
								placeholder="Enter company name"
								value={company}
								onChange={(e) => setCompany(e.target.value)}
								disabled={!!qrData}
							/>
						</div>

						{!qrData ? (
							<Button
								onClick={handleGenerate}
								disabled={isGenerating || !name.trim()}
								className="w-full"
								size="lg"
							>
								{isGenerating ? (
									<>
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
										Generating...
									</>
								) : (
									<>
										<QrCode className="h-5 w-5 mr-2" />
										Generate QR Code
									</>
								)}
							</Button>
						) : (
							<Button
								onClick={handleReset}
								variant="outline"
								className="w-full"
								size="lg"
							>
								Reset & Generate New
							</Button>
						)}
					</CardContent>
				</Card>

				{/* QR Code Display */}
				<Card>
					<CardHeader>
						<CardTitle>Generated QR Code</CardTitle>
					</CardHeader>
					<CardContent>
						{!qrData ? (
							<div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
								<div className="text-center text-muted-foreground">
									<QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
									<p>QR code will appear here</p>
								</div>
							</div>
						) : (
							<div className="space-y-4">
								{/* QR Code Image */}
								<div className="flex justify-center p-4 bg-white rounded-lg border">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={qrData.qrCodeDataUrl}
										alt="QR Code"
										className="w-64 h-64"
									/>
								</div>

								{/* Participant Info */}
								<div className="rounded-lg bg-muted p-4">
									<div className="space-y-1">
										<div className="font-medium">{name}</div>
										{company && (
											<div className="text-sm text-muted-foreground">
												{company}
											</div>
										)}
									</div>
								</div>

								{/* URL */}
								<div className="space-y-2">
									<Label>Access URL</Label>
									<div className="flex gap-2">
										<Input
											value={qrData.url}
											readOnly
											className="font-mono text-sm"
										/>
										<Button
											onClick={handleCopyUrl}
											variant="outline"
											size="icon"
											className="flex-shrink-0"
										>
											{copied ? (
												<Check className="h-4 w-4 text-green-600" />
											) : (
												<Copy className="h-4 w-4" />
											)}
										</Button>
									</div>
								</div>

								{/* Actions */}
								<div className="flex gap-2">
									<Button onClick={handleDownloadQR} className="flex-1">
										<Download className="h-4 w-4 mr-2" />
										Download QR
									</Button>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Instructions */}
			<Card>
				<CardHeader>
					<CardTitle>How to Use</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-muted-foreground">
					<ol className="list-decimal list-inside space-y-1">
						<li>Enter participant name and optional company</li>
						<li>Click "Generate QR Code" to create a unique access code</li>
						<li>Download or share the QR code with the participant</li>
						<li>
							Participant scans the QR code with their phone to register and
							access the voting system
						</li>
						<li>Each QR code is single-use and securely authenticated</li>
					</ol>
				</CardContent>
			</Card>
		</div>
	);
}
