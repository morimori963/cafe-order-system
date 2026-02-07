import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types";

interface UpdateStatusRequest {
  orderId: string;
  status: OrderStatus;
}

export async function PATCH(request: NextRequest) {
  try {
    const body: UpdateStatusRequest = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "必須パラメータが不足しています" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: order, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Status update error:", error);
      return NextResponse.json(
        { error: "ステータスの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 }
    );
  }
}
