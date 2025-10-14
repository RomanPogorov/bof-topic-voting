import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: topicId } = await params;
  // Auth is done via service_role key, but we need to check if the user
  // making the request is an admin. We get the user's auth token from the header.
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Now, we use the token to get the user's data from Supabase auth
  const { data: userData, error: userError } =
    await supabaseAdmin.auth.getUser(token);

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // With the user ID, we can check our custom participants table for their role
  const { data: participant, error: participantError } = await supabaseAdmin
    .from("participants")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  // If there's an error, or the user is not found, or they are not an admin, forbid access.
  if (participantError || participant?.role !== "admin") {
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
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
