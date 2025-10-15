import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ErrorCodes, type Vote } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { participantId, topicId, bofSessionId } = await request.json();

    if (!participantId || !topicId || !bofSessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Check if joining own topic (can't join your own topic - you're leading it)
    const { data: topic } = await supabaseAdmin
      .from("topics")
      .select("participant_id")
      .eq("id", topicId)
      .single();

    if (topic && topic.participant_id === participantId) {
      return NextResponse.json(
        { error: ErrorCodes.CANNOT_JOIN_OWN_TOPIC },
        { status: 400 }
      );
    }

    // 2. Check if user already joined a topic in this BOF
    const { data: existingVote } = await supabaseAdmin
      .from("votes")
      .select("*")
      .eq("bof_session_id", bofSessionId)
      .eq("participant_id", participantId)
      .single();

    let vote: Vote;

    // 3. If already joined, update to new topic
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
      // 4. Otherwise, create new join
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
  } catch (error: unknown) {
    console.error("Error joining topic:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to join topic" },
      { status: 500 }
    );
  }
}
