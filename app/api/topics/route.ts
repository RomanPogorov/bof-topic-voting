import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { participantId, bof_session_id, title, description } = body;

    if (!participantId || !bof_session_id || !title) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Admin/server insert ignores BOF status; still enforce one-topic-per-user-per-session
    const { data: existing } = await supabaseAdmin
      .from("topics")
      .select("id")
      .eq("participant_id", participantId)
      .eq("bof_session_id", bof_session_id)
      .single();
    if (existing) {
      return NextResponse.json(
        { error: "ALREADY_CREATED_TOPIC" },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("topics")
      .insert({
        participant_id: participantId,
        bof_session_id,
        title,
        description: description || null,
      })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ topic: data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
