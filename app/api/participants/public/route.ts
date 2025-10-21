import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/participants/public
 * Public endpoint to get list of participants for self-service login
 */
export async function GET() {
  try {
    const { data: participants, error } = await supabase
      .from("participants")
      .select("id, name, auth_token")
      .eq("is_blocked", false)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching participants:", error);
      return NextResponse.json(
        { error: "Failed to fetch participants" },
        { status: 500 }
      );
    }

    return NextResponse.json({ participants: participants || [] });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

