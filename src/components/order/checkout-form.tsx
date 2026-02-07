"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { Flame, Snowflake } from "lucide-react";

export function CheckoutForm() {
  const { items, getTotalAmount } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");

  const totalAmount = getTotalAmount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert("お名前を入力してください");
      return;
    }

    setLoading(true);

    try {
      // Stripe Checkout APIを呼び出し
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail: "",
          customerPhone: "",
          customerLineId: "",
          pickupTime: "",
          notes: "",
          notificationMethod: "email",
          items: items.map((item) => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            unitPrice: item.menuItem.price,
            options: item.temperature ? [{ name: item.temperature === "hot" ? "ホット" : "アイス" }] : [],
          })),
          totalAmount,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Stripeの決済画面へリダイレクト
        window.location.href = data.url;
      } else {
        alert(data.error || "決済の開始に失敗しました");
        setLoading(false);
      }
    } catch {
      alert("エラーが発生しました。もう一度お試しください。");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div className="kissaten-card rounded-lg overflow-hidden">
        <div className="bg-[var(--primary)] text-[var(--primary-foreground)] p-4">
          <h2 className="font-serif text-lg text-center">お名前</h2>
        </div>
        <div className="p-4">
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="お呼びするお名前"
            className="text-center font-serif text-lg py-6 border-2"
            required
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-2 text-center">
            準備ができましたらお呼びいたします
          </p>
        </div>
      </div>

      <div className="kissaten-card rounded-lg overflow-hidden">
        <div className="bg-[var(--primary)] text-[var(--primary-foreground)] p-4">
          <h2 className="font-serif text-lg text-center">ご注文内容</h2>
        </div>
        <div className="p-4 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-dashed border-[var(--border)] last:border-0">
              <span className="flex items-center gap-2 font-serif">
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
          <div className="border-t-2 border-[var(--primary)] pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-serif text-xl">合計</span>
              <span className="font-serif text-2xl text-[var(--primary)]">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 font-serif text-xl py-8 btn-kissaten"
        disabled={loading}
      >
        {loading ? "処理中..." : "注文を確定する"}
      </Button>
    </form>
  );
}
