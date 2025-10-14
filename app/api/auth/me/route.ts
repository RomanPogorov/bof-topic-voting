import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { participantId } = await request.json();
    if (!participantId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("participants")
      .select("*")
      .eq("id", participantId)
      .single();

    if (error || !data) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    return NextResponse.json({ participant: data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "SERVER_ERROR" }, { status: 500 });
  }
}


