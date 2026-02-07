"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, MenuItem, Temperature } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity: number, temperature: Temperature | null) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (menuItem, quantity, temperature) => {
        const cartItemId = `${menuItem.id}-${temperature || "none"}`;

        set((state) => {
          const existingItem = state.items.find((item) => item.id === cartItemId);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === cartItemId
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                      totalPrice: (item.quantity + quantity) * menuItem.price,
                    }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id: cartItemId,
                menuItem,
                quantity,
                temperature,
                totalPrice: quantity * menuItem.price,
              },
            ],
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                quantity,
                totalPrice: quantity * item.menuItem.price,
              };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalAmount: () => {
        return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "cafe-cart",
    }
  )
);
