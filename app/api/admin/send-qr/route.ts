import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { participantId, email, name, qrUrl } = await request.json();

    if (!participantId || !email || !name || !qrUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Проверяем что участник существует
    const { data: participant, error: participantError } = await supabaseAdmin
      .from("participants")
      .select("id, name, email")
      .eq("id", participantId)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Здесь можно добавить реальную отправку email через Resend, SendGrid и т.д.
    // Пока просто логируем
    console.log(`Sending QR code to ${email}:`, {
      participantId,
      name,
      qrUrl,
      timestamp: new Date().toISOString(),
    });

    // В реальном приложении здесь был бы код отправки email:
    // await sendEmail({
    //   to: email,
    //   subject: `Ваш QR код для BOF Voting System`,
    //   html: `
    //     <h2>Здравствуйте, ${name}!</h2>
    //     <p>Ваш QR код для участия в голосовании:</p>
    //     <p><a href="${qrUrl}">${qrUrl}</a></p>
    //     <p>Отсканируйте QR код или перейдите по ссылке для участия в голосовании.</p>
    //   `
    // });

    return NextResponse.json(
      {
        success: true,
        message: `QR code sent to ${email}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending QR code:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send QR code" },
      { status: 500 }
    );
  }
}
