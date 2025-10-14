import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { token, device } = await request.json();
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    // 1) Verify participant by token
    const { data: participant, error: pErr } = await supabaseAdmin
      .from("participants")
      .select("*")
      .eq("auth_token", token)
      .single();
    if (pErr || !participant) {
      return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });
    }

    if (participant.is_blocked) {
      return NextResponse.json({ error: "BLOCKED_USER" }, { status: 403 });
    }

    // 2) Upsert participant session
    const { data: session, error: sErr } = await supabaseAdmin
      .from("participant_sessions")
      .upsert({
        participant_id: participant.id,
        device_fingerprint: device?.fingerprint || "unknown",
        ip_address: device?.ipAddress || null,
        user_agent: device?.userAgent || null,
        last_activity: new Date().toISOString(),
      })
      .select()
      .single();
    if (sErr || !session) {
      return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ participant, session }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "SERVER_ERROR" }, { status: 500 });
  }
}


