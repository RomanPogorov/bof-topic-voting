import QRCode from "qrcode";
import { supabase } from "../supabase/client";
import { Participant, ErrorCodes } from "../types";

export class QRService {
  /**
   * Generate unique auth token
   */
  private static generateAuthToken(): string {
    // Generate random hex string client-safe
    const array = new Uint8Array(32);
    if (typeof window !== "undefined") {
      window.crypto.getRandomValues(array);
    } else {
      // Node.js environment
      const crypto = require("crypto");
      crypto.randomFillSync(array);
    }
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  /**
   * Generate QR code as data URL
   */
  private static async generateQRCode(url: string): Promise<string> {
    try {
      return await QRCode.toDataURL(url, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 512,
      });
    } catch (error) {
      throw new Error("Failed to generate QR code");
    }
  }

  /**
   * Create participant and generate QR code
   */
  static async createParticipantWithQR(params: {
    name: string;
    email: string;
    company?: string;
  }): Promise<{ participant: Participant; qrDataUrl: string }> {
    // Generate unique token
    const authToken = this.generateAuthToken();

    // Create participant
    const { data: participant, error } = await supabase
      .from("participants")
      .insert({
        name: params.name,
        email: params.email,
        company: params.company || null,
        auth_token: authToken,
      })
      .select()
      .single<Participant>();

    if (error || !participant) {
      throw new Error(ErrorCodes.SERVER_ERROR);
    }

    // Generate QR code URL
    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/${authToken}`;
    const qrDataUrl = await this.generateQRCode(qrUrl);

    return { participant, qrDataUrl };
  }

  /**
   * Bulk create participants with QR codes
   */
  static async bulkCreateParticipants(
    participants: Array<{ name: string; email: string; company?: string }>
  ): Promise<Array<{ participant: Participant; qrDataUrl: string }>> {
    const results = [];

    for (const participantData of participants) {
      try {
        const result = await this.createParticipantWithQR(participantData);
        results.push(result);
      } catch (error) {
        console.error(
          `Failed to create participant ${participantData.email}:`,
          error
        );
      }
    }

    return results;
  }

  /**
   * Regenerate QR code for existing participant
   */
  static async regenerateQR(participantId: string): Promise<string> {
    // Get participant
    const { data: participant } = await supabase
      .from("participants")
      .select("auth_token")
      .eq("id", participantId)
      .single();

    if (!participant) {
      throw new Error(ErrorCodes.SERVER_ERROR);
    }

    // Generate QR code
    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/${participant.auth_token}`;
    return await this.generateQRCode(qrUrl);
  }
}
