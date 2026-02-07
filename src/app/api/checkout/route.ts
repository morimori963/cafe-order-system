import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/utils";
import type { SelectedOption } from "@/types";

interface CheckoutItem {
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  options: SelectedOption[];
}

interface CheckoutRequest {
  items: CheckoutItem[];
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLineId: string;
  pickupTime: string;
  notes: string;
  notificationMethod: "email" | "line" | "both";
}

export async function POST(request: NextRequest) {
  try {
    // 環境変数チェック
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
      return NextResponse.json(
        { error: "サーバー設定エラー: DB接続キーが未設定です" },
        { status: 500 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "サーバー設定エラー: 決済キーが未設定です" },
        { status: 500 }
      );
    }

    const body: CheckoutRequest = await request.json();
    const {
      items,
      totalAmount,
      customerName,
      customerEmail,
      customerPhone,
      customerLineId,
      pickupTime,
      notes,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "カートが空です" },
        { status: 400 }
      );
    }

    if (!customerName) {
      return NextResponse.json(
        { error: "お名前を入力してください" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();
    const orderNumber = generateOrderNumber();

    // 受取時間を計算
    let pickupDateTime: string | null = null;
    if (pickupTime) {
      const today = new Date();
      const [hours, minutes] = pickupTime.split(":").map(Number);
      today.setHours(hours, minutes, 0, 0);
      pickupDateTime = today.toISOString();
    }

    // 注文を作成
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: customerName,
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null,
        customer_line_id: customerLineId || null,
        status: "pending",
        total_amount: totalAmount,
        notes: notes || null,
        pickup_time: pickupDateTime,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: `注文の作成に失敗しました: ${orderError?.message || "不明なエラー"}` },
        { status: 500 }
      );
    }

    // メニューアイテム情報を先に取得
    const { data: menuItems } = await supabase
      .from("menu_items")
      .select("id, name")
      .in(
        "id",
        items.map((i) => i.menuItemId)
      );

    const menuItemMap = new Map(menuItems?.map((m) => [m.id, m.name]) || []);

    // 注文明細を作成（menu_item_nameを含める）
    const orderItems = items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      menu_item_name: menuItemMap.get(item.menuItemId) || "商品",
      quantity: item.quantity,
      unit_price: item.unitPrice,
      options: item.options,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items creation error:", JSON.stringify(itemsError));
      console.error("Order items data:", JSON.stringify(orderItems));
      // 注文を削除
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: `注文明細の作成に失敗しました: ${itemsError.message || itemsError.code || JSON.stringify(itemsError)}` },
        { status: 500 }
      );
    }

    // Stripe Checkout Sessionを作成
    const lineItems = items.map((item) => {
      const itemName = menuItemMap.get(item.menuItemId) || "商品";
      const optionNames =
        item.options.length > 0
          ? ` (${item.options.map((o) => o.name).join(", ")})`
          : "";

      return {
        price_data: {
          currency: "jpy",
          product_data: {
            name: `${itemName}${optionNames}`,
          },
          unit_amount: item.unitPrice,
        },
        quantity: item.quantity,
      };
    });

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?cancelled=true`,
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
      },
      customer_email: customerEmail || undefined,
    });

    // Payment Intent IDを保存
    await supabase
      .from("orders")
      .update({ stripe_payment_intent_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "決済処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
