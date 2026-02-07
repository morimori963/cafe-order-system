import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, Coffee, Package, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderItem, MenuItem, OrderStatus } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "success" | "warning" }
> = {
  pending: {
    label: "決済待ち",
    icon: <Clock className="h-4 w-4" />,
    variant: "secondary",
  },
  confirmed: {
    label: "注文確定",
    icon: <CheckCircle className="h-4 w-4" />,
    variant: "default",
  },
  preparing: {
    label: "準備中",
    icon: <Coffee className="h-4 w-4" />,
    variant: "warning",
  },
  ready: {
    label: "準備完了",
    icon: <Package className="h-4 w-4" />,
    variant: "success",
  },
  completed: {
    label: "受取済み",
    icon: <CheckCircle className="h-4 w-4" />,
    variant: "secondary",
  },
  cancelled: {
    label: "キャンセル",
    icon: <Clock className="h-4 w-4" />,
    variant: "secondary",
  },
};

export default async function OrderPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(
        *,
        menu_item:menu_items(*)
      )
    `)
    .eq("id", id)
    .single();

  if (!order) {
    notFound();
  }

  const typedOrder = order as Order & {
    items: (OrderItem & { menu_item: MenuItem })[];
  };

  const status = statusConfig[typedOrder.status];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
          {status.icon}
        </div>
        <h1 className="text-2xl font-bold">注文番号: {typedOrder.order_number}</h1>
        <Badge variant={status.variant} className="gap-1">
          {status.icon}
          {status.label}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>注文詳細</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">お名前</span>
              <span>{typedOrder.customer_name}</span>
            </div>
            {typedOrder.pickup_time && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">受取予定時間</span>
                <span>
                  {new Date(typedOrder.pickup_time).toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">注文日時</span>
              <span>
                {new Date(typedOrder.created_at).toLocaleString("ja-JP")}
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">注文内容</h3>
            <div className="space-y-2">
              {typedOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.menu_item?.name || "商品"} x{item.quantity}
                    {item.options && item.options.length > 0 && (
                      <span className="text-[var(--muted-foreground)]">
                        {" "}
                        ({(item.options as { name: string }[]).map((o) => o.name).join(", ")})
                      </span>
                    )}
                  </span>
                  <span>{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span>合計</span>
            <span className="text-[var(--primary)]">
              {formatPrice(typedOrder.total_amount)}
            </span>
          </div>

          {typedOrder.notes && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-1">備考</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {typedOrder.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {typedOrder.status === "ready" && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="py-4 text-center">
            <p className="font-semibold text-green-700 dark:text-green-300">
              商品の準備が完了しました！カウンターにてお受け取りください。
            </p>
          </CardContent>
        </Card>
      )}

      <Button asChild className="w-full">
        <Link href="/">
          <Home className="h-4 w-4 mr-2" />
          メニューに戻る
        </Link>
      </Button>
    </div>
  );
}
