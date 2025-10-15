import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function PATCH(
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

  // Get the topic to check ownership
  const { data: topic, error: topicError } = await supabaseAdmin
    .from("topics")
    .select("participant_id")
    .eq("id", topicId)
    .single();

  if (topicError || !topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  // Check if user is admin OR author of the topic
  const isAdmin = participant.role === "admin";
  const isAuthor = topic.participant_id === participant.id;

  if (!isAdmin && !isAuthor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get the update data from request body
  const body = await request.json();
  const { title, description } = body;

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (title.trim().length < 5) {
    return NextResponse.json(
      { error: "Title must be at least 5 characters" },
      { status: 400 }
    );
  }

  // Proceed with update
  try {
    const { data: updatedTopic, error } = await supabaseAdmin
      .from("topics")
      .update({
        title: title.trim(),
        description: description?.trim() || null,
      })
      .eq("id", topicId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ topic: updatedTopic }, { status: 200 });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "SERVER_ERROR";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
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

  // Get the topic to check ownership
  const { data: topic, error: topicError } = await supabaseAdmin
    .from("topics")
    .select("participant_id")
    .eq("id", topicId)
    .single();

  if (topicError || !topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  // Check if user is admin OR author of the topic
  const isAdmin = participant.role === "admin";
  const isAuthor = topic.participant_id === participant.id;

  if (!isAdmin && !isAuthor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Proceed with deletion
  try {
    // Note: Supabase is configured with cascading deletes in the schema.
    // Deleting a topic will automatically delete all associated votes.
    const { error } = await supabaseAdmin
      .from("topics")
      .delete()
      .eq("id", topicId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "SERVER_ERROR";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
