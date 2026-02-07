import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendLineOrderConfirmation } from "@/lib/line";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (orderId) {
      const supabase = await createServiceClient();

      // 注文ステータスを更新
      const { data: order, error } = await supabase
        .from("orders")
        .update({ status: "confirmed" })
        .eq("id", orderId)
        .select(`
          *,
          items:order_items(
            *,
            menu_item:menu_items(*)
          )
        `)
        .single();

      if (!error && order) {
        // 通知を送信
        try {
          if (order.customer_email) {
            await sendOrderConfirmationEmail(order);
          }
          if (order.customer_line_id) {
            await sendLineOrderConfirmation(order);
          }
        } catch (notifyError) {
          console.error("Notification error:", notifyError);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
