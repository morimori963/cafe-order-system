import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { OrderList } from "@/components/admin/order-list";
import { DailySummary } from "@/components/admin/daily-summary";
import type { Order, OrderItem } from "@/types";

export const dynamic = "force-dynamic";

type OrderWithItems = Order & { items: OrderItem[] };

async function getOrders(): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(*)
    `)
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }

  return (orders || []) as OrderWithItems[];
}

async function getDailySummary() {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: orders } = await supabase
    .from("orders")
    .select("total_amount, status")
    .gte("created_at", today.toISOString())
    .in("status", ["confirmed", "preparing", "ready", "completed"]);

  const totalSales = orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0;
  const orderCount = orders?.length || 0;

  return { totalSales, orderCount };
}

export default async function AdminPage() {
  const [orders, summary] = await Promise.all([getOrders(), getDailySummary()]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">注文管理</h1>

      <DailySummary totalSales={summary.totalSales} orderCount={summary.orderCount} />

      <Suspense fallback={<div>読み込み中...</div>}>
        <OrderList initialOrders={orders} />
      </Suspense>
    </div>
  );
}
