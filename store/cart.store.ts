import { CartCustomization, CartStore } from "@/types";
import { PriceCalculator } from "@/utils/PriceCalculator";
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
    selectedItems: [], // Added: Stores the keys of selected items

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
            const itemKey = generateCartItemKey(item.id, customizations);
            set({
                items: [...get().items, { ...item, quantity: 1, customizations, _key: itemKey}],
                selectedItems: [...get().selectedItems, itemKey], // New items are selected by default
            });
        }
    },

    removeItem: (key: string) => {
        set({
            items: get().items.filter((i) => i._key !== key),
            selectedItems: get().selectedItems.filter((k) => k !== key), // Also remove selection state
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

    clearCart: () => set({ items: [], selectedItems: [] }), 

    // Selection-related methods
    toggleItemSelection: (key: string) => {
        const selectedItems = get().selectedItems;
        const isSelected = selectedItems.includes(key);
        set({
            selectedItems: isSelected
                ? selectedItems.filter((k) => k !== key)
                : [...selectedItems, key]
        });
    },

    selectAllItems: () => {
        set({
            selectedItems: get().items.map((item) => item._key || generateCartItemKey(item.id, item.customizations))
        });
    },

    deselectAllItems: () => {
        set({ selectedItems: [] });
    },

    getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

    getTotalPrice: () =>
        get().items.reduce((total, item) => {
            // Convert CartCustomization to SelectedCustomization format
            const customizations = item.customizations?.map(c => ({
                ...c,
                quantity: 1 // Default quantity for customizations in the cart is 1
            })) || [];
            
            return total + PriceCalculator.calculateTotalPrice(item.price, item.quantity, customizations);
        }, 0),

    // Selected items calculation methods
    getSelectedTotalItems: () => {
        const { items, selectedItems } = get();
        return items
            .filter((item) => selectedItems.includes(item._key || generateCartItemKey(item.id, item.customizations)))
            .reduce((total, item) => total + item.quantity, 0);
    },

    getSelectedTotalPrice: () => {
        const { items, selectedItems } = get();
        return items
            .filter((item) => selectedItems.includes(item._key || generateCartItemKey(item.id, item.customizations)))
            .reduce((total, item) => {
                // Convert CartCustomization to SelectedCustomization format
                const customizations = item.customizations?.map(c => ({
                    ...c,
                    quantity: 1 // Default quantity for customizations in the cart is 1
                })) || [];
                
                return total + PriceCalculator.calculateTotalPrice(item.price, item.quantity, customizations);
            }, 0);
    },
}));