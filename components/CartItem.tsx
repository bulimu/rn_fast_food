import { images } from "@/constants";
import { useCartStore } from "@/store/cart.store";
import { CartItemType } from "@/types";
import { PriceCalculator } from "@/utils/PriceCalculator";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { increaseQty, decreaseQty, removeItem, selectedItems, toggleItemSelection } =
    useCartStore();

  const itemKey = item._key!;
  const isSelected = selectedItems.includes(itemKey);

  const customizations = (item.customizations || []).map((c) => ({
    ...c,
    quantity: c.quantity || 1,
  }));

  const totalItemPrice = PriceCalculator.calculateTotalPrice(
    item.price,
    item.quantity,
    customizations
  );

  const handleToggle = () => toggleItemSelection(itemKey);
  const handleIncrease = () => increaseQty(itemKey);
  const handleDecrease = () => decreaseQty(itemKey);
  const handleRemove = () => removeItem(itemKey);

  return (
    <View className="cart-item" style={{ elevation: 5, shadowColor: "#878787" }}>
      <View className="flex-row items-center flex-1">
        {/* Checkbox */}
        <TouchableOpacity onPress={handleToggle} className="mr-3 self-center">
          <View
            className={`w-6 h-6 border-2 rounded ${
              isSelected ? "bg-primary border-primary" : "border-gray-300"
            } flex-center`}
          >
            <Image
              source={images.check}
              style={{ width: 14, height: 14, tintColor: "#fff", opacity: isSelected ? 1 : 0 }}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        {/* Product Image */}
        <View className="cart-item__image">
          <Image
            source={{ uri: item.image_url }}
            className="size-4/5 rounded-lg"
            resizeMode="cover"
          />
        </View>

        {/* Info + Controls */}
        <View className="flex-1 ml-3">
          <Text className="base-bold text-dark-100" numberOfLines={1}>
            {item.name}
          </Text>

          {/* Customizations */}
          {customizations.length > 0 && (
            <View className="mt-1">
              {customizations.map((c, i) => (
                <Text key={i} className="text-gray-600 text-xs" numberOfLines={1}>
                  {c.name}
                  {c.quantity > 1 ? ` x${c.quantity}` : ""}
                  {c.price > 0 && ` (+${PriceCalculator.formatPrice(c.price)})`}
                </Text>
              ))}
            </View>
          )}

          {/* Price */}
          <Text className="paragraph-bold text-primary mt-1">
            {PriceCalculator.formatPrice(totalItemPrice)}
            {customizations.length > 0 && (
              <Text className="text-gray-500 text-xs">
                {` (Base: ${PriceCalculator.formatPrice(item.price)})`}
              </Text>
            )}
          </Text>

          {/* Quantity Controls */}
          <View className="flex-row items-center gap-x-4 mt-2">
            <TouchableOpacity onPress={handleDecrease} className="cart-item__actions">
              <Image
                source={images.minus}
                className="size-1/2"
                resizeMode="contain"
                style={{ tintColor: "#FF9C01" }}
              />
            </TouchableOpacity>

            <Text className="base-bold text-dark-100 min-w-[20px] text-center">
              {item.quantity}
            </Text>

            <TouchableOpacity onPress={handleIncrease} className="cart-item__actions">
              <Image
                source={images.plus}
                className="size-1/2"
                resizeMode="contain"
                style={{ tintColor: "#FF9C01" }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity onPress={handleRemove} className="flex-center ml-2 self-center">
          <Image source={images.trash} className="size-5" resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(CartItem);