import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    console.log("Fetching participants...");

    // Fetch participants with stats
    const { data: participantsData, error: participantsError } =
      await supabaseAdmin
        .from("participants")
        .select("*")
        .order("created_at", { ascending: false });

    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      throw participantsError;
    }

    console.log(`Found ${participantsData?.length || 0} participants`);

    // Fetch stats for each participant
    const participantsWithStats = await Promise.all(
      (participantsData || []).map(async (participant) => {
        const [votesRes, topicsRes, achievementsRes] = await Promise.all([
          supabaseAdmin
            .from("votes")
            .select("id", { count: "exact", head: true })
            .eq("participant_id", participant.id),
          supabaseAdmin
            .from("topics")
            .select("id", { count: "exact", head: true })
            .eq("participant_id", participant.id),
          supabaseAdmin
            .from("participant_achievements")
            .select("achievement:achievements(points)", { count: "exact" })
            .eq("participant_id", participant.id),
        ]);

        const totalPoints =
          achievementsRes.data?.reduce((sum, pa) => {
            const achievement = pa.achievement as { points?: number } | null;
            return sum + (achievement?.points || 0);
          }, 0) || 0;

        return {
          ...participant,
          votes_cast: votesRes.count || 0,
          topics_created: topicsRes.count || 0,
          achievements_count: achievementsRes.count || 0,
          total_points: totalPoints,
        };
      })
    );

    return NextResponse.json(
      { participants: participantsWithStats },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch participants",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, company } = await request.json();

    console.log("Creating participant:", { name, email, company });

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Генерируем уникальный auth_token для QR кода
    const authToken = uuidv4();
    console.log("Generated auth token:", authToken);

    // Создаем участника
    const { data: participant, error } = await supabaseAdmin
      .from("participants")
      .insert({
        name,
        email: email || null,
        company: company || null,
        auth_token: authToken,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating participant:", error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    console.log("Successfully created participant:", participant);
    return NextResponse.json({ participant }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating participant:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create participant",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const deleteAll = searchParams.get("all") === "true";

    if (deleteAll) {
      // Удалить всех участников
      console.log("Deleting all participants...");

      const { error } = await supabaseAdmin
        .from("participants")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (error) {
        console.error("Error deleting all participants:", error);
        throw error;
      }

      console.log("Successfully deleted all participants");
      return NextResponse.json(
        { message: "All participants deleted successfully" },
        { status: 200 }
      );
    } else if (id) {
      // Удалить одного участника
      console.log("Deleting participant:", id);

      const { error } = await supabaseAdmin
        .from("participants")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting participant:", error);
        throw error;
      }

      console.log("Successfully deleted participant:", id);
      return NextResponse.json(
        { message: "Participant deleted successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Missing id or all parameter" },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    console.error("Error in DELETE handler:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete participant(s)",
      },
      { status: 500 }
    );
  }
}
