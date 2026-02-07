"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { useEffect, useState } from "react";

export function CartIcon() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="rounded-full border-2 border-[var(--primary)]" asChild>
        <Link href="/cart">
          <ShoppingBag className="h-5 w-5 text-[var(--primary)]" />
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative rounded-full border-2 border-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors"
      asChild
    >
      <Link href="/cart">
        <ShoppingBag className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-serif rounded-full h-5 w-5 flex items-center justify-center border-2 border-[var(--background)]">
            {totalItems > 99 ? "99" : totalItems}
          </span>
        )}
      </Link>
    </Button>
  );
}
