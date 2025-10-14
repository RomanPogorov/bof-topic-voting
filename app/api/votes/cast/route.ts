import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ErrorCodes } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { participantId, topicId, bofSessionId } = await request.json();

    if (!participantId || !topicId || !bofSessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Check if voting for own topic
    const { data: topic } = await supabaseAdmin
      .from("topics")
      .select("participant_id")
      .eq("id", topicId)
      .single();

    if (topic && topic.participant_id === participantId) {
      return NextResponse.json(
        { error: ErrorCodes.CANNOT_VOTE_OWN_TOPIC },
        { status: 400 }
      );
    }

    // 2. Check if user already voted in this BOF
    const { data: existingVote } = await supabaseAdmin
      .from("votes")
      .select("*")
      .eq("bof_session_id", bofSessionId)
      .eq("participant_id", participantId)
      .single();

    let vote;

    // 3. If voted, update to new topic
    if (existingVote) {
      const { data, error } = await supabaseAdmin
        .from("votes")
        .update({
          topic_id: topicId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingVote.id)
        .select()
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: ErrorCodes.SERVER_ERROR },
          { status: 500 }
        );
      }

      vote = data;
    } else {
      // 4. Otherwise, create new vote
      const { data, error } = await supabaseAdmin
        .from("votes")
        .insert({
          topic_id: topicId,
          participant_id: participantId,
          bof_session_id: bofSessionId,
        })
        .select()
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: ErrorCodes.SERVER_ERROR },
          { status: 500 }
        );
      }

      vote = data;
    }

    return NextResponse.json({ vote }, { status: 200 });
  } catch (error: any) {
    console.error("Error casting vote:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cast vote" },
      { status: 500 }
    );
  }
}
