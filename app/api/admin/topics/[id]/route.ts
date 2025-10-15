import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

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

  // If there's an error, or the user is not found, or they are not an admin, forbid access.
  if (participantError || !participant || participant.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // If we've reached this point, the user is a verified admin. Proceed with deletion.
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
