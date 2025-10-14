"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Participant } from "../types";
import { AuthService } from "../services/auth.service";
import { useRouter } from "next/navigation";
import { ROUTES } from "../constants/routes";

interface AuthContextType {
	participant: Participant | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	logout: () => Promise<void>;
	refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [participant, setParticipant] = useState<Participant | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	const loadParticipant = async () => {
		try {
			setIsLoading(true);
			const participant = await AuthService.getCurrentParticipant();
			setParticipant(participant);
		} catch (error) {
			setParticipant(null);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadParticipant();
	}, []);

	const logout = async () => {
		await AuthService.logout();
		setParticipant(null);
		router.push(ROUTES.HOME);
	};

	const refresh = async () => {
		await loadParticipant();
	};

	return (
		<AuthContext.Provider
			value={{
				participant,
				isLoading,
				isAuthenticated: !!participant,
				logout,
				refresh,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
