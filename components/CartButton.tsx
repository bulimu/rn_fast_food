import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { images } from "@/constants"; // Adjust the import path as necessary
import { useCartStore } from "@/store/cart.store"; // Adjust the import path as necessary
import { router } from 'expo-router';


const CartButton = () => {
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <TouchableOpacity className="cart-btn" onPress={() => router.push('/(tabs)/cart')}>

      <Image source={images.bag} className="size-5" resizeMode="contain" />
      {totalItems > 0 && (
        <View className="cart-badge">
          <Text className="text-white small-bold">{totalItems}</Text>
        </View>
      )}

    </TouchableOpacity>
  );
};

export default CartButton;
