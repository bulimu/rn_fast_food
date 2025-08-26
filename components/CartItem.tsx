import { images } from "@/constants";
import { useCartStore } from "@/store/cart.store";
import { CartItemType } from "@/types";
import { PriceCalculator } from "@/utils/PriceCalculator";
import { Image, Text, TouchableOpacity, View } from "react-native";

const CartItem = ({ item }: { item: CartItemType }) => {
  const { increaseQty, decreaseQty, removeItem, selectedItems, toggleItemSelection } = useCartStore();

  const itemKey = item._key!;
  const isSelected = selectedItems.includes(itemKey);

  // Fix type issues by converting item.customizations to SelectedCustomization[]
  const customizations = (item.customizations || []).map(custom => ({
    ...custom,
    quantity: custom.quantity || 1, // Ensure quantity exists
  }));

  // Use PriceCalculator to calculate prices
  const customizationsPrice = PriceCalculator.calculateCustomizationPrice(customizations);
  const totalItemPrice = PriceCalculator.calculateTotalPrice(item.price, 1, customizations);

  return (
    <View className="cart-item" style={{ elevation: 5, shadowColor: '#878787' }}>
      <View className="flex-row items-center flex-1">
        {/* Selection checkbox - aligned to the left */}
        <TouchableOpacity
          onPress={() => toggleItemSelection(itemKey)}
          className="flex-center mr-3 self-center"
        >
          <View className={`w-6 h-6 border-2 rounded ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'} flex-center`}>
            {isSelected && (
              <Image
                source={images.check}
                className="w-3 h-3"
                resizeMode="contain"
                tintColor="white"
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Product image */}
        <View className="cart-item__image">
          <Image
            source={{ uri: item.image_url }}
            className="size-4/5 rounded-lg"
            resizeMode="cover"
          />
        </View>

        {/* Product information */}
        <View className="flex-1 ml-3">
          <Text className="base-bold text-dark-100">{item.name}</Text>

          {/* Display customization options */}
          {item.customizations && item.customizations.length > 0 && (
            <View className="mt-1">
              {item.customizations.map((custom, index) => (
                <Text key={index} className="text-gray-600 text-xs">
                  {custom.name} x{custom.quantity} {custom.price > 0 && `(+${PriceCalculator.formatPrice(custom.price)})`}
                </Text>
              ))}
            </View>
          )}

          <Text className="paragraph-bold text-primary mt-1  ">
            {PriceCalculator.formatPrice(totalItemPrice)}
            {customizationsPrice > 0 && (
              <Text className="text-gray-500 text-xs">
                {` (Base: ${PriceCalculator.formatPrice(item.price)})`}
              </Text>
            )}
          </Text>

          {/* Quantity controls */}
          <View className="flex flex-row items-center gap-x-4 mt-2">
            <TouchableOpacity
              onPress={() => decreaseQty(itemKey)}
              className="cart-item__actions"
            >
              <Image
                source={images.minus}
                className="size-1/2"
                resizeMode="contain"
                tintColor={"#FF9C01"}
              />
            </TouchableOpacity>

            <Text className="base-bold text-dark-100">{item.quantity}</Text>

            <TouchableOpacity
              onPress={() => increaseQty(itemKey)}
              className="cart-item__actions"
            >
              <Image
                source={images.plus}
                className="size-1/2"
                resizeMode="contain"
                tintColor={"#FF9C01"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Delete button */}
        <TouchableOpacity
          onPress={() => removeItem(itemKey)}
          className="flex-center ml-2 self-center"
        >
          <Image source={images.trash} className="size-5" resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartItem;