import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { participantId, bof_session_id, title, description } = body;

    if (!participantId || !bof_session_id || !title) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check participant's role
    const { data: participant, error: participantError } = await supabaseAdmin
      .from("participants")
      .select("role")
      .eq("id", participantId)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    const isAdmin = participant.role === "admin";

    // Enforce one-topic-per-user-per-session, unless the user is an admin
    if (!isAdmin) {
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
    } else {
      // For admins, check if they're trying to create a duplicate
      // but allow it by using a different approach
      console.log("Admin creating topic - bypassing unique constraint check");
    }

    // When creating a topic, remove any existing joins/votes in this session
    // because the user is now a LEAD and cannot join other topics
    await supabaseAdmin
      .from("votes")
      .delete()
      .eq("participant_id", participantId)
      .eq("bof_session_id", bof_session_id);

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

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        {
          error: error.message || "Failed to create topic",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "Topic was not created",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ topic: data }, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
