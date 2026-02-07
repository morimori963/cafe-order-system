"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCartStore } from "@/stores/cart-store";
import { useEffect, useState } from "react";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-[var(--muted-foreground)] font-serif">
          読み込み中...
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <div className="w-20 h-20 rounded-full bg-[var(--muted)] flex items-center justify-center">
          <ShoppingBag className="h-10 w-10 text-[var(--muted-foreground)]" />
        </div>
        <div className="text-center">
          <h1 className="font-serif text-2xl text-[var(--primary)]">
            お盆は空です
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            メニューからお選びください
          </p>
        </div>
        <Button asChild className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 btn-kissaten">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            メニューに戻る
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="font-serif text-2xl text-[var(--primary)]">ご注文内容</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 kissaten-card rounded-lg p-4">
          <div className="space-y-0">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
