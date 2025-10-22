import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: topicId } = await params;

  // Get the user's auth token from the header
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check the custom participants table using auth_token
  const { data: participant, error: participantError } = await supabaseAdmin
    .from("participants")
    .select("id, role")
    .eq("auth_token", token)
    .single();

  if (participantError || !participant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins can move topics
  if (participant.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get the target session ID from request body
  const body = await request.json();
  const { targetSessionId } = body;

  if (!targetSessionId) {
    return NextResponse.json(
      { error: "Target session ID is required" },
      { status: 400 }
    );
  }

  // Verify the target session exists
  const { data: targetSession, error: sessionError } = await supabaseAdmin
    .from("bof_sessions")
    .select("id")
    .eq("id", targetSessionId)
    .single();

  if (sessionError || !targetSession) {
    return NextResponse.json(
      { error: "Target session not found" },
      { status: 404 }
    );
  }

  // Verify the topic exists
  const { data: topic, error: topicError } = await supabaseAdmin
    .from("topics")
    .select("id, bof_session_id")
    .eq("id", topicId)
    .single();

  if (topicError || !topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  // Proceed with moving the topic
  try {
    // Update the topic's bof_session_id
    const { error: updateTopicError } = await supabaseAdmin
      .from("topics")
      .update({ bof_session_id: targetSessionId })
      .eq("id", topicId);

    if (updateTopicError) {
      throw new Error(updateTopicError.message);
    }

    // Update all associated votes to point to the new session
    const { error: updateVotesError } = await supabaseAdmin
      .from("votes")
      .update({ bof_session_id: targetSessionId })
      .eq("topic_id", topicId);

    if (updateVotesError) {
      throw new Error(updateVotesError.message);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "SERVER_ERROR";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
