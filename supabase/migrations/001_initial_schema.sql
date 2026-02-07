-- カテゴリテーブル
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- メニューテーブル
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INT NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- メニューオプションテーブル
CREATE TABLE menu_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_diff INT DEFAULT 0
);

-- 注文テーブル
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_line_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount INT NOT NULL CHECK (total_amount >= 0),
  stripe_payment_intent_id TEXT,
  notes TEXT,
  pickup_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 注文明細テーブル
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price INT NOT NULL CHECK (unit_price >= 0),
  options JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 管理者テーブル
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 公開読み取りポリシー（メニュー）
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can view available menu items" ON menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Public can view menu options" ON menu_options FOR SELECT USING (true);

-- 注文ポリシー（認証不要で注文可能）
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their order by number" ON orders FOR SELECT USING (true);
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view order items" ON order_items FOR SELECT USING (true);

-- 管理者ポリシー
CREATE POLICY "Admins can do everything on categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);
CREATE POLICY "Admins can do everything on menu_items" ON menu_items FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);
CREATE POLICY "Admins can do everything on menu_options" ON menu_options FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);
CREATE POLICY "Admins can do everything on orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);
CREATE POLICY "Admins can do everything on order_items" ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);
CREATE POLICY "Admins can view admins" ON admins FOR SELECT USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- updated_atの自動更新
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- サンプルデータ
INSERT INTO categories (name, sort_order) VALUES
  ('コーヒー', 1),
  ('ティー', 2),
  ('フード', 3),
  ('デザート', 4);

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order) VALUES
  ((SELECT id FROM categories WHERE name = 'コーヒー'), 'ブレンドコーヒー', '当店自慢のオリジナルブレンド', 400, true, 1),
  ((SELECT id FROM categories WHERE name = 'コーヒー'), 'カフェラテ', 'エスプレッソとスチームミルク', 480, true, 2),
  ((SELECT id FROM categories WHERE name = 'コーヒー'), 'カプチーノ', 'エスプレッソとフォームミルク', 480, true, 3),
  ((SELECT id FROM categories WHERE name = 'コーヒー'), 'アメリカーノ', 'エスプレッソをお湯で割ったコーヒー', 420, true, 4),
  ((SELECT id FROM categories WHERE name = 'ティー'), '紅茶', 'アールグレイ', 400, true, 1),
  ((SELECT id FROM categories WHERE name = 'ティー'), '抹茶ラテ', '京都産抹茶使用', 520, true, 2),
  ((SELECT id FROM categories WHERE name = 'ティー'), 'ほうじ茶ラテ', '香ばしいほうじ茶', 500, true, 3),
  ((SELECT id FROM categories WHERE name = 'フード'), 'サンドイッチ', 'BLTサンド', 580, true, 1),
  ((SELECT id FROM categories WHERE name = 'フード'), 'トースト', 'はちみつバタートースト', 380, true, 2),
  ((SELECT id FROM categories WHERE name = 'デザート'), 'チーズケーキ', '濃厚ベイクドチーズケーキ', 450, true, 1),
  ((SELECT id FROM categories WHERE name = 'デザート'), 'ティラミス', 'エスプレッソが香る', 480, true, 2);

-- コーヒー系のオプション
INSERT INTO menu_options (menu_item_id, name, price_diff) VALUES
  ((SELECT id FROM menu_items WHERE name = 'ブレンドコーヒー'), 'Lサイズ', 100),
  ((SELECT id FROM menu_items WHERE name = 'カフェラテ'), 'Lサイズ', 100),
  ((SELECT id FROM menu_items WHERE name = 'カフェラテ'), 'オーツミルクに変更', 50),
  ((SELECT id FROM menu_items WHERE name = 'カプチーノ'), 'Lサイズ', 100),
  ((SELECT id FROM menu_items WHERE name = 'アメリカーノ'), 'Lサイズ', 100);

-- Realtime有効化
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
