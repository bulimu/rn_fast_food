import { Models } from "react-native-appwrite";

export interface MenuItem extends Models.Document {
    name: string;
    price: number;
    image_url: string;
    description: string;
    calories: number;
    protein: number;
    rating: number;
    type: string;
}

export interface Category extends Models.Document {
    name: string;
    description: string;
}

export interface User extends Models.Document {
    name: string;
    email: string;
    avatar: string;
    phone?: string; // Optional phone number field
} 

export interface CartCustomization {
    id: string;
    name: string;
    price: number;
    type: string;
    quantity?: number ; // Added quantity property
}

export interface CartItemType {
    _key?: string; // Unique key for item + customizations
    id: string; // Menu item ID
    name: string;
    price: number;
    image_url: string;
    quantity: number;
    customizations?: CartCustomization[];
}

export interface CartStore {
    items: CartItemType[];
    selectedItems: string[]; // Stores the keys of selected items
    addItem: (item: Omit<CartItemType, "quantity">) => void;
    removeItem: (key: string) => void;
    increaseQty: (key: string) => void;
    decreaseQty: (key: string) => void;
    clearCart: () => void;
    toggleItemSelection: (key: string) => void; // select/deselect single item
    selectAllItems: () => void; // all items selected
    deselectAllItems: () => void; // all items deselected
    getTotalItems: () => number;
    getTotalPrice: () => number;
    getSelectedTotalItems: () => number; 
    getSelectedTotalPrice: () => number; 
}

export interface ProductCustomization extends Models.Document {
    name: string;
    price: number;
    type: 'topping' | 'side' | 'size';
    image_url?: string;
}

export interface ProductDetail extends MenuItem {
    customizations: ProductCustomization[];
    deliveryInfo: {
        isFree: boolean;
        time: string;
        rating: number;
    };
    categories: Category[]; // changed from string[] to Category[]
    nutritionInfo: {
        calories: number;
        protein: number;
    };
    tags: string[];
}
 

interface TabBarIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
    title: string;
}

interface PaymentInfoStripeProps {
    label: string;
    value: string;
    labelStyle?: string;
    valueStyle?: string;
}

interface CustomButtonProps {
    onPress?: () => void;
    title?: string;
    style?: string;
    leftIcon?: React.ReactNode;
    textStyle?: string;
    isLoading?: boolean;
}

interface CustomHeaderProps {
    title?: string;
    rightComponent?: React.ReactNode;
}

interface CustomInputProps {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    label: string;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

interface ProfileFieldProps {
    label: string;
    value: string;
    icon: ImageSourcePropType;
}

interface CreateUserPrams {
    email: string;
    password: string;
    name: string;
}

interface SignInParams {
    email: string;
    password: string;
}

interface GetMenuParams {
    category: string;
    query: string;
}

// Address interface
export interface Address extends Models.Document {
    userId: User | string; // Changed to relationship
    title: string;
    address: string;
    city: string;
    postalCode?: string;
    country: string;
    isDefault?: boolean;
}

// Order interfaces
export interface Order extends Models.Document {
    user_id: User | string; // Changed to relationship
    order_number: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
    payment_status: 'unpaid' | 'paid' | 'failed' | 'refunded';
    payment_intent_id?: string;
    total_amount: number;
    tax_amount?: number;
    delivery_fee?: number;
    delivery_address_id?: Address | string; // Changed to relationship
    customer_notes?: string;
    estimated_delivery_time?: string;
}

export interface OrderItem extends Models.Document {
    order_id: Order | string; // Changed to relationship
    menu_item_id: MenuItem | string; // Changed to relationship
    item_name: string;
    item_price: number;
    quantity: number;
    subtotal: number;
}

export interface OrderItemCustomization extends Models.Document {
    order_item_id: OrderItem | string; // Changed to relationship
    customization_id: ProductCustomization | string; // Changed to relationship (using ProductCustomization which matches customizations table)
    customization_name: string;
    customization_price: number;
    customization_type: 'topping' | 'side' | 'size' | 'crust' | 'bread' | 'spice' | 'base' | 'sauce';
    quantity: number;
}

// Order creation parameters (still use IDs for creation)
export interface CreateOrderParams {
    userId: string; // Still use string ID for creation
    items: CartItemType[];
    totalAmount: number;
    deliveryAddressId?: string; // Still use string ID for creation
    customerNotes?: string;
}
