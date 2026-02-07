"use client";

import { useState } from "react";
import { Flame, Snowflake, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { MenuItem, Temperature } from "@/types";

interface TemperatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem;
}

export function TemperatureDialog({
  open,
  onOpenChange,
  item,
}: TemperatureDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [temperature, setTemperature] = useState<Temperature>("hot");
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(item, quantity, temperature);
    onOpenChange(false);
    setQuantity(1);
    setTemperature("hot");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[var(--card)] border-2 border-[var(--primary)]">
        <DialogHeader className="text-center">
          <DialogTitle className="font-serif text-2xl text-[var(--primary)]">
            {item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {item.description && (
            <p className="text-sm text-[var(--muted-foreground)] text-center">
              {item.description}
            </p>
          )}

          <div className="text-center">
            <span className="font-serif text-2xl text-[var(--primary)]">
              {formatPrice(item.price)}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-center text-sm font-serif text-[var(--muted-foreground)]">
              ─ お好みをお選びください ─
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTemperature("hot")}
                className={`flex flex-col items-center justify-center gap-2 p-5 rounded-lg border-2 transition-all ${
                  temperature === "hot"
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--border)] hover:border-[var(--primary)]/50"
                }`}
              >
                <Flame className={`h-8 w-8 ${temperature === "hot" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} />
                <span className={`font-serif text-lg ${temperature === "hot" ? "text-[var(--primary)]" : ""}`}>
                  温かい
                </span>
              </button>
              <button
                onClick={() => setTemperature("ice")}
                className={`flex flex-col items-center justify-center gap-2 p-5 rounded-lg border-2 transition-all ${
                  temperature === "ice"
                    ? "border-blue-600 bg-blue-50"
                    : "border-[var(--border)] hover:border-blue-400"
                }`}
              >
                <Snowflake className={`h-8 w-8 ${temperature === "ice" ? "text-blue-600" : "text-[var(--muted-foreground)]"}`} />
                <span className={`font-serif text-lg ${temperature === "ice" ? "text-blue-600" : ""}`}>
                  冷たい
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-2"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-serif text-3xl w-12 text-center">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-2"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAddToCart}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 font-serif text-lg py-6 btn-kissaten"
          >
            注文に追加する ({formatPrice(item.price * quantity)})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
