"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Flame, Snowflake } from "lucide-react";
import type { Order, OrderItem, OrderStatus } from "@/types";

type OrderWithItems = Order & { items: OrderItem[] };

interface OrderCardProps {
  order: OrderWithItems;
}

const statusConfig: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }> = {
  pending: { label: "決済待ち", variant: "secondary" },
  confirmed: { label: "注文確定", variant: "default" },
  preparing: { label: "準備中", variant: "warning" },
  ready: { label: "準備完了", variant: "success" },
  completed: { label: "受取済み", variant: "secondary" },
  cancelled: { label: "キャンセル", variant: "destructive" },
};

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  confirmed: "preparing",
  preparing: "ready",
  ready: "completed",
};

const nextStatusLabel: Partial<Record<OrderStatus, string>> = {
  confirmed: "準備開始",
  preparing: "準備完了",
  ready: "受取完了",
};

export function OrderCard({ order }: OrderCardProps) {
  const [updating, setUpdating] = useState(false);

  const handleNextStatus = async () => {
    const next = nextStatus[order.status];
    if (!next) return;

    setUpdating(true);
    try {
      const response = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status: next }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert("ステータスの更新に失敗しました");
    } finally {
      setUpdating(false);
    }
  };

  const config = statusConfig[order.status];
  const next = nextStatus[order.status];

  return (
    <Card className={`${order.status === "ready" ? "border-green-500 border-2 bg-green-50/50" : ""}`}>
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-2xl font-mono">{order.order_number}</CardTitle>
            <div className="text-lg font-medium mt-1">{order.customer_name} 様</div>
          </div>
          <Badge variant={config.variant} className="shrink-0">{config.label}</Badge>
        </div>
        <div className="text-xs text-[var(--muted-foreground)]">
          {new Date(order.created_at).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <div className="space-y-1 bg-[var(--muted)] p-3 rounded-lg">
          {order.items?.map((item) => (
            <div key={item.id} className="text-sm flex items-center gap-2 flex-wrap">
              <span className="font-medium">{item.menu_item_name}</span>
              <span className="text-[var(--muted-foreground)]">×{item.quantity}</span>
              {item.temperature === "hot" && (
                <span className="flex items-center gap-0.5 text-xs text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                  <Flame className="h-3 w-3" />温
                </span>
              )}
              {item.temperature === "ice" && (
                <span className="flex items-center gap-0.5 text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                  <Snowflake className="h-3 w-3" />冷
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t">
          <span className="font-bold text-xl">{formatPrice(order.total_amount)}</span>
          {next && (
            <Button
              onClick={handleNextStatus}
              disabled={updating}
              variant={order.status === "preparing" ? "default" : "outline"}
              className="w-full sm:w-auto"
              size="lg"
            >
              {updating ? "更新中..." : nextStatusLabel[order.status]}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
