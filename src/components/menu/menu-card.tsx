"use client";

import Image from "next/image";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TemperatureDialog } from "./temperature-dialog";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { MenuItem } from "@/types";

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (item.has_temperature) {
      setShowDialog(true);
    } else {
      addItem(item, 1, null);
    }
  };

  return (
    <>
      <div className="menu-card rounded-lg overflow-hidden">
        <div className="relative aspect-square bg-[var(--muted)]">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl opacity-60">☕</span>
            </div>
          )}
          {!item.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="font-serif">売り切れ</Badge>
            </div>
          )}
          {item.has_temperature && item.is_available && (
            <div className="absolute top-2 right-2 flex gap-1">
              <span className="bg-[var(--card)]/95 text-[var(--primary)] text-xs px-2 py-1 rounded font-serif border border-[var(--primary)]">
                HOT / ICE
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-lg truncate text-[var(--foreground)]">
                {item.name}
              </h3>
              {item.description && (
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mt-1">
                  {item.description}
                </p>
              )}
              <p className="font-serif text-xl mt-3 text-[var(--primary)]">
                {formatPrice(item.price)}
              </p>
            </div>
            <Button
              size="icon"
              onClick={handleAddToCart}
              disabled={!item.is_available}
              className="shrink-0 bg-[var(--primary)] hover:bg-[var(--primary)]/90 btn-kissaten"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <TemperatureDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        item={item}
      />
    </>
  );
}
