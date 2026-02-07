"use client";

import { MenuCard } from "./menu-card";
import type { MenuItem } from "@/types";

interface MenuListProps {
  menuItems: MenuItem[];
}

export function MenuList({ menuItems }: MenuListProps) {
  if (menuItems.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        メニューがありません
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {menuItems
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
    </div>
  );
}
