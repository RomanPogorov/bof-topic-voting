import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // Тестируем подключение к базе данных
    const { data, error } = await supabaseAdmin
      .from("participants")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Database connection error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Database connection successful",
        data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
