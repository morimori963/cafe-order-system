import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface OrderItemInput {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  temperature: string | null;
}

interface OrderRequest {
  customerName: string;
  items: OrderItemInput[];
  totalAmount: number;
}

function generateOrderNumber(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${hours}${minutes}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json();
    const { customerName, items, totalAmount } = body;

    if (!customerName || !items || items.length === 0) {
      return NextResponse.json(
        { error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const orderNumber = generateOrderNumber();

    // 注文を作成
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: customerName,
        status: "confirmed",
        total_amount: totalAmount,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "注文の作成に失敗しました" },
        { status: 500 }
      );
    }

    // 注文明細を作成
    const orderItems = items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      menu_item_name: item.menuItemName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      temperature: item.temperature,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "注文明細の作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.order_number,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json(
      { error: "注文処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
