"use client";

import { Minus, Plus, Trash2, Flame, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 py-4 border-b border-dashed border-[var(--border)]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-lg truncate">{item.menuItem.name}</h3>
          {item.temperature === "hot" && (
            <span className="flex items-center gap-1 text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded font-serif">
              <Flame className="h-3 w-3" />
              温
            </span>
          )}
          {item.temperature === "ice" && (
            <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-serif">
              <Snowflake className="h-3 w-3" />
              冷
            </span>
          )}
        </div>
        <p className="font-serif text-lg text-[var(--primary)] mt-1">
          {formatPrice(item.totalPrice)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-serif text-lg">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[var(--destructive)]"
          onClick={() => removeItem(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
