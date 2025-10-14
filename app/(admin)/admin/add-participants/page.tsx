"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ParticipantInput {
	name: string;
	surname: string;
	email?: string;
	company?: string;
}

export default function AddParticipantsPage() {
	const [inputText, setInputText] = useState("");
	const [parsedParticipants, setParsedParticipants] = useState<
		ParticipantInput[]
	>([]);
	const [isCreating, setIsCreating] = useState(false);
	const [createdCount, setCreatedCount] = useState(0);

	const parseParticipants = () => {
		const lines = inputText
			.trim()
			.split("\n")
			.filter((line) => line.trim());
		const participants: ParticipantInput[] = [];

		for (const line of lines) {
			const parts = line.split(",").map((part) => part.trim());

			if (parts.length < 2) {
				toast.error(
					`Неверный формат строки: "${line}". Нужно минимум Name, Surname`,
				);
				continue;
			}

			const [name, surname, email, company] = parts;

			if (!name || !surname) {
				toast.error(
					`Неверный формат строки: "${line}". Name и Surname обязательны`,
				);
				continue;
			}

			participants.push({
				name,
				surname,
				email: email || undefined,
				company: company || undefined,
			});
		}

		setParsedParticipants(participants);
		toast.success(`Найдено ${participants.length} участников`);
	};

	const createParticipants = async () => {
		if (parsedParticipants.length === 0) {
			toast.error("Сначала добавьте участников");
			return;
		}

		setIsCreating(true);
		let successCount = 0;

		try {
			for (const participant of parsedParticipants) {
				const response = await fetch("/api/admin/participants", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: `${participant.name} ${participant.surname}`,
						email: participant.email,
						company: participant.company,
					}),
				});

				if (response.ok) {
					successCount++;
				} else {
					const { error } = await response.json();
					console.error(
						`Error creating participant ${participant.name}:`,
						error,
					);
				}
			}

			setCreatedCount(successCount);
			toast.success(
				`Создано ${successCount} из ${parsedParticipants.length} участников`,
			);

			// Очищаем форму
			setInputText("");
			setParsedParticipants([]);
		} catch (error) {
			console.error("Error creating participants:", error);
			toast.error("Ошибка при создании участников");
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-4xl font-bold">Добавить участников</h1>
				<p className="text-muted-foreground mt-2">
					Массовое добавление участников с генерацией QR кодов
				</p>
			</div>

			{/* Instructions */}
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					<strong>Формат ввода:</strong> Каждый участник на новой строке, поля
					через запятую.
					<br />
					<strong>Обязательные поля:</strong> Имя, Фамилия
					<br />
					<strong>Опциональные поля:</strong> Email, Компания
					<br />
					<strong>Пример:</strong> Иван, Петров, ivan@example.com, ООО Рога и
					Копыта
				</AlertDescription>
			</Alert>

			{/* Input Form */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Добавить участников
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label htmlFor="participants-input">
							Список участников (один на строку):
						</Label>
						<Textarea
							id="participants-input"
							placeholder="Иван, Петров, ivan@example.com, ООО Рога и Копыта&#10;Мария, Сидорова, maria@example.com, ИП Сидорова&#10;Алексей, Козлов"
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							className="min-h-[200px] font-mono text-sm"
						/>
					</div>

					<div className="flex gap-2">
						<Button onClick={parseParticipants} variant="outline">
							<Upload className="h-4 w-4 mr-2" />
							Парсить участников
						</Button>
						<Button
							onClick={createParticipants}
							disabled={parsedParticipants.length === 0 || isCreating}
						>
							<Plus className="h-4 w-4 mr-2" />
							{isCreating
								? "Создаем..."
								: `Создать ${parsedParticipants.length} участников`}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Parsed Participants Preview */}
			{parsedParticipants.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>
							Предварительный просмотр ({parsedParticipants.length} участников)
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2 max-h-60 overflow-y-auto">
							{parsedParticipants.map((participant, index) => (
								<div
									key={`${participant.name}-${participant.surname}-${index}`}
									className="flex items-center gap-2 p-2 bg-gray-50 rounded"
								>
									<Badge variant="outline">{index + 1}</Badge>
									<div className="flex-1">
										<span className="font-medium">
											{participant.name} {participant.surname}
										</span>
										{participant.email && (
											<span className="text-sm text-gray-600 ml-2">
												({participant.email})
											</span>
										)}
										{participant.company && (
											<span className="text-sm text-gray-600 ml-2">
												- {participant.company}
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Success Message */}
			{createdCount > 0 && (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Успешно создано {createdCount} участников! QR коды сгенерированы
						автоматически и доступны в разделе "Участники".
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}
