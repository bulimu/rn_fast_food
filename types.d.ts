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
} 

export interface CartCustomization {
    id: string;
    name: string;
    price: number;
    type: string;
    quantity: number; // Added quantity property
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

export interface SelectedCustomization {
    id: string;
    name: string;
    price: number;
    type: string;
    quantity: number;
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
