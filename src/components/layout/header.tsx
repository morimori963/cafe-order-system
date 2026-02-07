"use client";

import Link from "next/link";
import { Coffee } from "lucide-react";
import { CartIcon } from "@/components/cart/cart-icon";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-[var(--primary)] bg-[var(--background)]">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
            <Coffee className="h-5 w-5 text-[var(--primary-foreground)]" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl tracking-wider text-[var(--primary)]">
              珈琲館
            </span>
            <span className="text-[10px] text-[var(--muted-foreground)] tracking-widest">
              COFFEE HOUSE
            </span>
          </div>
        </Link>
        <CartIcon />
      </div>
    </header>
  );
}
