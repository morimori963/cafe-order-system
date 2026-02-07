"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { OrderCard } from "./order-card";
import type { Order, OrderItem } from "@/types";

type OrderWithItems = Order & { items: OrderItem[] };

interface OrderListProps {
  initialOrders: OrderWithItems[];
}

export function OrderList({ initialOrders }: OrderListProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { data: newOrder } = await supabase
              .from("orders")
              .select(`*, items:order_items(*)`)
              .eq("id", payload.new.id)
              .single();

            if (newOrder) {
              setOrders((prev) => [newOrder as OrderWithItems, ...prev]);
              // 通知音（ブラウザで再生できる場合）
              try {
                const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleikdQJ7Z8OeQaBxBhMf");
                audio.play().catch(() => {});
              } catch {}
            }
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const activeOrders = orders.filter(
    (o) => !["completed", "cancelled"].includes(o.status)
  );
  const completedOrders = orders.filter((o) =>
    ["completed", "cancelled"].includes(o.status)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">
          進行中の注文 ({activeOrders.length}件)
        </h2>
        {activeOrders.length === 0 ? (
          <p className="text-[var(--muted-foreground)] text-center py-8">
            進行中の注文はありません
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {completedOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            完了した注文 ({completedOrders.length}件)
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-60">
            {completedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
