import { CartCustomization, CartItemType, CartStore } from "@/types";
import { PriceCalculator } from "@/utils/PriceCalculator";
import { create } from "zustand";

// --- Helper Functions ---

function areCustomizationsEqual(
    a: CartCustomization[] = [],
    b: CartCustomization[] = []
): boolean {
    if (a.length !== b.length) return false;

    const aSorted = [...a].sort((x, y) => x.id.localeCompare(y.id));
    const bSorted = [...b].sort((x, y) => x.id.localeCompare(y.id));

    return aSorted.every((item, idx) => {
        const bItem = bSorted[idx];
        return (
            item.id === bItem.id &&
            item.name === bItem.name &&
            item.price === bItem.price &&
            item.type === bItem.type
        );
    });
}

function generateCartItemKey(
    itemId: string,
    customizations: CartCustomization[] = []
): string {
    const sortedCustomizations = [...customizations]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((c) => `${c.id}-${c.price}`)
        .join("|");

    return `${itemId}::${sortedCustomizations}`;
}

/** Calculate the price for a single cart item including customizations */
function calcItemPrice(item: CartItemType): number {
    const customizations =
        item.customizations?.map((c) => ({ ...c, quantity: c.quantity || 1 })) || [];
    return PriceCalculator.calculateTotalPrice(item.price, item.quantity, customizations);
}

/** Get key for an item, generating one if missing */
function getItemKey(item: CartItemType): string {
    return item._key || generateCartItemKey(item.id, item.customizations);
}

// --- Store ---

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    selectedItems: [],

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
                items: [
                    ...get().items,
                    { ...item, quantity: 1, customizations, _key: itemKey },
                ],
                selectedItems: [...get().selectedItems, itemKey], // Auto-select new items
            });
        }
    },

    removeItem: (key: string) => {
        set({
            items: get().items.filter((i) => i._key !== key),
            selectedItems: get().selectedItems.filter((k) => k !== key),
        });
    },

    increaseQty: (key: string) => {
        set({
            items: get().items.map((i) =>
                i._key === key ? { ...i, quantity: i.quantity + 1 } : i
            ),
        });
    },

    decreaseQty: (key: string) => {
        const updatedItems = get()
            .items.map((i) =>
                i._key === key ? { ...i, quantity: i.quantity - 1 } : i
            )
            .filter((i) => i.quantity > 0);

        // Clean up selectedItems for any removed items
        const remainingKeys = new Set(updatedItems.map((i) => i._key));
        set({
            items: updatedItems,
            selectedItems: get().selectedItems.filter((k) => remainingKeys.has(k)),
        });
    },

    clearCart: () => set({ items: [], selectedItems: [] }),

    clearSelectedItems: () => {
        const { items, selectedItems } = get();
        set({
            items: items.filter((item) => !selectedItems.includes(getItemKey(item))),
            selectedItems: [],
        });
    },

    toggleItemSelection: (key: string) => {
        const { selectedItems } = get();
        set({
            selectedItems: selectedItems.includes(key)
                ? selectedItems.filter((k) => k !== key)
                : [...selectedItems, key],
        });
    },

    selectAllItems: () => {
        set({ selectedItems: get().items.map(getItemKey) });
    },

    deselectAllItems: () => {
        set({ selectedItems: [] });
    },

    getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

    getTotalPrice: () =>
        get().items.reduce((total, item) => total + calcItemPrice(item), 0),

    getSelectedTotalItems: () => {
        const { items, selectedItems } = get();
        return items
            .filter((item) => selectedItems.includes(getItemKey(item)))
            .reduce((total, item) => total + item.quantity, 0);
    },

    getSelectedTotalPrice: () => {
        const { items, selectedItems } = get();
        return items
            .filter((item) => selectedItems.includes(getItemKey(item)))
            .reduce((total, item) => total + calcItemPrice(item), 0);
    },

    getSelectedItems: () => {
        const { items, selectedItems } = get();
        return items.filter((item) => selectedItems.includes(getItemKey(item)));
    },
}));