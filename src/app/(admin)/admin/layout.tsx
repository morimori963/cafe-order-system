export const dynamic = "force-dynamic";

import Link from "next/link";
import { Coffee, ClipboardList, UtensilsCrossed, Menu } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* モバイルヘッダー */}
      <header className="sticky top-0 z-40 bg-[var(--background)] border-b md:hidden">
        <div className="flex items-center justify-between p-4">
          <Link href="/admin" className="flex items-center gap-2 font-bold">
            <Coffee className="h-6 w-6 text-[var(--primary)]" />
            <span>管理画面</span>
          </Link>
        </div>
        <nav className="flex border-t">
          <Link
            href="/admin"
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm hover:bg-[var(--muted)] transition-colors"
          >
            <ClipboardList className="h-4 w-4" />
            注文
          </Link>
          <Link
            href="/admin/menu"
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm hover:bg-[var(--muted)] transition-colors border-l"
          >
            <UtensilsCrossed className="h-4 w-4" />
            メニュー
          </Link>
        </nav>
      </header>

      <div className="flex">
        {/* デスクトップサイドバー */}
        <aside className="w-64 bg-[var(--secondary)] border-r hidden md:block fixed h-screen">
          <div className="p-4">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
              <Coffee className="h-6 w-6 text-[var(--primary)]" />
              <span>管理画面</span>
            </Link>
          </div>
          <nav className="p-2 space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[var(--muted)] transition-colors"
            >
              <ClipboardList className="h-5 w-5" />
              注文管理
            </Link>
            <Link
              href="/admin/menu"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[var(--muted)] transition-colors"
            >
              <UtensilsCrossed className="h-5 w-5" />
              メニュー管理
            </Link>
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              ← 店舗ページへ
            </Link>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 md:ml-64 p-4 md:p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
