import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const participantId = url.searchParams.get("participantId");
    const bofSessionId = url.searchParams.get("bofSessionId");

    if (!participantId || !bofSessionId) {
      return NextResponse.json(
        { error: "Missing participantId or bofSessionId" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("votes")
      .select("*")
      .eq("participant_id", participantId)
      .eq("bof_session_id", bofSessionId)
      .single();

    if (error) {
      return NextResponse.json({ vote: null }, { status: 200 });
    }

    return NextResponse.json({ vote: data }, { status: 200 });
  } catch (error: any) {
    console.error("Error getting user vote:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get user vote" },
      { status: 500 }
    );
  }
}
