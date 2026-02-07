"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { DollarSign, ShoppingBag } from "lucide-react";

interface DailySummaryProps {
  totalSales: number;
  orderCount: number;
}

export function DailySummary({ totalSales, orderCount }: DailySummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">本日の売上</CardTitle>
          <DollarSign className="h-4 w-4 text-[var(--muted-foreground)]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[var(--primary)]">
            {formatPrice(totalSales)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">本日の注文数</CardTitle>
          <ShoppingBag className="h-4 w-4 text-[var(--muted-foreground)]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orderCount}件</div>
        </CardContent>
      </Card>
    </div>
  );
}
