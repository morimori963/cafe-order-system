import { Resend } from "resend";
import type { Order, OrderItem } from "@/types";
import { formatPrice } from "./utils";

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendOrderConfirmationEmail(
  order: Order & { items: OrderItem[] }
) {
  if (!order.customer_email) return;

  const itemsList = order.items
    .map(
      (item) =>
        `- ${item.menu_item?.name} x${item.quantity}: ${formatPrice(item.unit_price * item.quantity)}`
    )
    .join("\n");

  const resend = getResend();
  await resend.emails.send({
    from: "Cafe Order <noreply@yourdomain.com>",
    to: order.customer_email,
    subject: `注文確認 - 注文番号: ${order.order_number}`,
    text: `
ご注文ありがとうございます。

注文番号: ${order.order_number}
お名前: ${order.customer_name}
${order.pickup_time ? `受取予定時間: ${new Date(order.pickup_time).toLocaleString("ja-JP")}` : ""}

【ご注文内容】
${itemsList}

合計: ${formatPrice(order.total_amount)}

${order.notes ? `備考: ${order.notes}` : ""}

準備ができ次第、再度ご連絡いたします。
    `.trim(),
  });
}

export async function sendOrderReadyEmail(order: Order) {
  if (!order.customer_email) return;

  const resend = getResend();
  await resend.emails.send({
    from: "Cafe Order <noreply@yourdomain.com>",
    to: order.customer_email,
    subject: `商品の準備完了 - 注文番号: ${order.order_number}`,
    text: `
${order.customer_name} 様

注文番号 ${order.order_number} の商品の準備が完了しました。
カウンターにてお受け取りください。

ご来店ありがとうございます。
    `.trim(),
  });
}
