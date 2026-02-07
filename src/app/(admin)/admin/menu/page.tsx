"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import { Plus, Pencil, Trash2, Flame, Snowflake, Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import type { MenuItem } from "@/types";

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    has_temperature: false,
    is_available: true,
    image_url: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order");

    if (error) {
      console.error("Fetch error:", error);
    }
    setMenuItems((data || []) as MenuItem[]);
    setLoading(false);
  };

  const handleEdit = (item: MenuItem) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price,
      has_temperature: item.has_temperature,
      is_available: item.is_available,
      image_url: item.image_url || "",
    });
    setShowDialog(true);
  };

  const handleAdd = () => {
    setEditItem(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      has_temperature: false,
      is_available: true,
      image_url: "",
    });
    setShowDialog(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (2MB以下)
    if (file.size > 2 * 1024 * 1024) {
      alert("ファイルサイズは2MB以下にしてください");
      return;
    }

    // 画像形式チェック
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください");
      return;
    }

    setUploading(true);

    try {
      // ファイル名を生成
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `menu-images/${fileName}`;

      // Supabase Storageにアップロード
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) {
        // ストレージが未設定の場合はBase64で保存
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setFormData({ ...formData, image_url: base64 });
        };
        reader.readAsDataURL(file);
      } else {
        // 公開URLを取得
        const { data: { publicUrl } } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);
        setFormData({ ...formData, image_url: publicUrl });
      }
    } catch (error) {
      console.error("Upload error:", error);
      // フォールバック: Base64で保存
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData({ ...formData, image_url: base64 });
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const dataToSave = {
      name: formData.name,
      description: formData.description || null,
      price: formData.price,
      has_temperature: formData.has_temperature,
      is_available: formData.is_available,
      image_url: formData.image_url || null,
      sort_order: editItem?.sort_order || menuItems.length + 1,
    };

    if (editItem) {
      const { error } = await supabase
        .from("menu_items")
        .update(dataToSave)
        .eq("id", editItem.id);
      if (error) {
        console.error("Update error:", error);
        alert("保存に失敗しました: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("menu_items").insert(dataToSave);
      if (error) {
        console.error("Insert error:", error);
        alert("保存に失敗しました: " + error.message);
        return;
      }
    }
    setShowDialog(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このメニューを削除しますか？")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      alert("削除に失敗しました: " + error.message);
      return;
    }
    fetchData();
  };

  const toggleAvailability = async (item: MenuItem) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: !item.is_available })
      .eq("id", item.id);
    if (error) {
      console.error("Toggle error:", error);
      return;
    }
    fetchData();
  };

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">メニュー管理</h1>
        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          メニュー追加
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>メニュー一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {menuItems.length === 0 ? (
            <p className="text-center text-[var(--muted-foreground)] py-8">
              メニューがありません。「メニュー追加」から追加してください。
            </p>
          ) : (
            <div className="space-y-3">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3"
                >
                  <div className="flex items-center gap-3">
                    {/* サムネイル */}
                    <div className="w-12 h-12 rounded-lg bg-[var(--muted)] overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          ☕
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{item.name}</span>
                        {item.has_temperature && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Flame className="h-3 w-3 text-red-500" />
                            <Snowflake className="h-3 w-3 text-blue-500" />
                          </span>
                        )}
                        {!item.is_available && (
                          <Badge variant="secondary">売り切れ</Badge>
                        )}
                      </div>
                      <div className="text-sm text-[var(--muted-foreground)]">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAvailability(item)}
                      className="text-xs"
                    >
                      {item.is_available ? "売り切れ" : "販売再開"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "メニュー編集" : "メニュー追加"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* 画像アップロード */}
            <div className="space-y-2">
              <Label>商品画像</Label>
              <div className="flex flex-col items-center gap-3">
                {formData.image_url ? (
                  <div className="relative w-full aspect-square max-w-[200px] rounded-lg overflow-hidden bg-[var(--muted)]">
                    <Image
                      src={formData.image_url}
                      alt="プレビュー"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: "" })}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-square max-w-[200px] rounded-lg border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--primary)] transition-colors"
                  >
                    {uploading ? (
                      <span className="text-sm text-[var(--muted-foreground)]">アップロード中...</span>
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-[var(--muted-foreground)]" />
                        <span className="text-sm text-[var(--muted-foreground)]">クリックして画像を選択</span>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {!formData.image_url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    画像をアップロード
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>商品名 *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="例: カフェラテ"
              />
            </div>
            <div className="space-y-2">
              <Label>説明</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="例: エスプレッソとスチームミルク"
              />
            </div>
            <div className="space-y-2">
              <Label>価格 *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                placeholder="例: 480"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="has_temperature"
                checked={formData.has_temperature}
                onChange={(e) =>
                  setFormData({ ...formData, has_temperature: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="has_temperature" className="cursor-pointer">
                ホット/アイス選択あり
              </Label>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="w-full sm:w-auto">
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || formData.price <= 0} className="w-full sm:w-auto">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
