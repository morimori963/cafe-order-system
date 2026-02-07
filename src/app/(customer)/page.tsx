import { createClient } from "@/lib/supabase/server";
import { MenuList } from "@/components/menu/menu-list";
import type { MenuItem } from "@/types";

export const revalidate = 60;

async function getMenuItems() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("sort_order");

  if (error) {
    console.error("Failed to fetch menu items:", error);
    return [];
  }

  return (data || []) as MenuItem[];
}

export default async function HomePage() {
  const menuItems = await getMenuItems();

  return (
    <div className="space-y-8">
      {/* ヘッダー装飾 */}
      <div className="text-center py-6">
        <p className="text-sm tracking-[0.3em] text-[var(--muted-foreground)] mb-2">
          MENU
        </p>
        <h1 className="font-serif text-3xl text-[var(--primary)]">
          お品書き
        </h1>
        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="w-12 h-px bg-[var(--primary)]/30"></span>
          <span className="text-[var(--primary)] text-lg">✦</span>
          <span className="w-12 h-px bg-[var(--primary)]/30"></span>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mt-4">
          お好きなお飲み物をお選びください
        </p>
      </div>

      <MenuList menuItems={menuItems} />

      {/* フッター装飾 */}
      <div className="text-center py-8 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--muted-foreground)] tracking-widest">
          ごゆっくりどうぞ
        </p>
      </div>
    </div>
  );
}
