import { messagingApi } from "@line/bot-sdk";
import type { Order, OrderItem } from "@/types";
import { formatPrice } from "./utils";

function getLineClient() {
  if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");
  }
  return new messagingApi.MessagingApiClient({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  });
}

export async function sendLineOrderConfirmation(
  order: Order & { items: OrderItem[] }
) {
  if (!order.customer_line_id) return;

  const itemsList = order.items
    .map(
      (item) =>
        `${item.menu_item?.name} x${item.quantity}: ${formatPrice(item.unit_price * item.quantity)}`
    )
    .join("\n");

  const message = `
ご注文ありがとうございます

注文番号: ${order.order_number}
${order.pickup_time ? `受取予定: ${new Date(order.pickup_time).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}` : ""}

【ご注文内容】
${itemsList}

合計: ${formatPrice(order.total_amount)}

準備ができ次第ご連絡します
  `.trim();

  const client = getLineClient();
  await client.pushMessage({
    to: order.customer_line_id,
    messages: [{ type: "text", text: message }],
  });
}

export async function sendLineOrderReady(order: Order) {
  if (!order.customer_line_id) return;

  const message = `
${order.customer_name} 様

注文番号 ${order.order_number} の準備が完了しました

カウンターにてお受け取りください

ご来店ありがとうございます
  `.trim();

  const client = getLineClient();
  await client.pushMessage({
    to: order.customer_line_id,
    messages: [{ type: "text", text: message }],
  });
}
