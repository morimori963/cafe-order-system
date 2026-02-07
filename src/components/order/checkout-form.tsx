"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { Flame, Snowflake, CheckCircle } from "lucide-react";

export function CheckoutForm() {
  const { items, getTotalAmount, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const totalAmount = getTotalAmount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert("お名前を入力してください");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          items: items.map((item) => ({
            menuItemId: item.menuItem.id,
            menuItemName: item.menuItem.name,
            quantity: item.quantity,
            unitPrice: item.menuItem.price,
            temperature: item.temperature,
          })),
          totalAmount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderNumber(data.orderNumber);
        setSuccess(true);
        clearCart();
      } else {
        alert(data.error || "注文に失敗しました");
      }
    } catch {
      alert("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="kissaten-card rounded-lg max-w-md mx-auto overflow-hidden">
        <div className="bg-[var(--primary)] text-[var(--primary-foreground)] p-6 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-3" />
          <h2 className="font-serif text-2xl">ご注文承りました</h2>
        </div>
        <div className="p-6 text-center space-y-6">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">お呼び出し番号</p>
            <p className="font-serif text-4xl text-[var(--primary)] mt-2">{orderNumber}</p>
          </div>
          <div className="border-t border-dashed border-[var(--border)] pt-6">
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              お席でお待ちください。<br />
              準備ができましたら<br />
              番号でお呼びいたします。
            </p>
          </div>
          <Button
            asChild
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 font-serif py-6 btn-kissaten"
          >
            <a href="/">メニューに戻る</a>
          </Button>
        </div>
      </div>
    );
  }

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
