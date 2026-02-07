"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { Flame, Snowflake } from "lucide-react";

export function CartSummary() {
  const { items, getTotalAmount } = useCartStore();
  const totalAmount = getTotalAmount();

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="kissaten-card rounded-lg overflow-hidden">
      <div className="bg-[var(--primary)] text-[var(--primary-foreground)] p-4">
        <h2 className="font-serif text-lg text-center">お会計</h2>
      </div>
      <div className="p-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              {item.menuItem.name} ×{item.quantity}
              {item.temperature === "hot" && (
                <Flame className="h-3 w-3 text-[var(--primary)]" />
              )}
              {item.temperature === "ice" && (
                <Snowflake className="h-3 w-3 text-blue-500" />
              )}
            </span>
            <span className="font-serif">{formatPrice(item.totalPrice)}</span>
          </div>
        ))}
        <div className="border-t-2 border-dashed border-[var(--border)] pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="font-serif text-lg">合計</span>
            <span className="font-serif text-2xl text-[var(--primary)]">
              {formatPrice(totalAmount)}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4 pt-0">
        <Button
          asChild
          className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 font-serif text-lg py-6 btn-kissaten"
        >
          <Link href="/checkout">注文を確定する</Link>
        </Button>
      </div>
    </div>
  );
}
