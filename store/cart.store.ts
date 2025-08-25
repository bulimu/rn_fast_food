import { CartCustomization, CartStore } from "@/types";
import { create } from "zustand";

function areCustomizationsEqual(
    a: CartCustomization[] = [],
    b: CartCustomization[] = []
): boolean {
    if (a.length !== b.length) return false;

    const aSorted = [...a].sort((x, y) => x.id.localeCompare(y.id));
    const bSorted = [...b].sort((x, y) => x.id.localeCompare(y.id));

   //return aSorted.every((item, idx) => item.id === bSorted[idx].id); 
   return aSorted.every((item, idx) => {
        const bItem = bSorted[idx];
        return item.id === bItem.id && 
               item.name === bItem.name && 
               item.price === bItem.price &&
               item.type === bItem.type;
    });
}

function generateCartItemKey(itemId: string, customizations: CartCustomization[] = []): string {
    const sortedCustomizations = [...customizations]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map(c => `${c.id}-${c.price}`)
        .join('|');
    
    return `${itemId}::${sortedCustomizations}`;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],

    addItem: (item) => {
        const customizations = item.customizations ?? [];

        const existing = get().items.find(
            (i) =>
                i.id === item.id &&
                areCustomizationsEqual(i.customizations ?? [], customizations)
        );

        if (existing) {
            set({
                items: get().items.map((i) =>
                    i.id === item.id &&
                    areCustomizationsEqual(i.customizations ?? [], customizations)
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                ),
            });
        } else {
            set({
                items: [...get().items, { ...item, quantity: 1, customizations, _key: generateCartItemKey(item.id, customizations)}],
            });
        }
    },

    removeItem: (key: string) => {
        set({
            items: get().items.filter((i) => i._key !== key),
        });
    },

    increaseQty: (key: string) => {
        set({
            items: get().items.map((i) =>
                i._key === key
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            ),
        });
    },

    decreaseQty: (key: string) => {
        set({
            items: get()
                .items.map((i) =>
                    i._key === key
                        ? { ...i, quantity: i.quantity - 1 }
                        : i
                )
                .filter((i) => i.quantity > 0),
        });
    },

    clearCart: () => set({ items: [] }),

    getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

    getTotalPrice: () =>
        get().items.reduce((total, item) => {
            const base = item.price;
            const customPrice =
                item.customizations?.reduce(
                    (s: number, c: CartCustomization) => s + c.price,
                    0
                ) ?? 0;
            return total + item.quantity * (base + customPrice);
        }, 0),
}));