import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { images } from "@/constants"; // Adjust the import path as necessary


const CartButton = () => {
  const totalItems = 10; // Replace with actual logic to get total items in cart
  return (
    <TouchableOpacity className="cart-btn" onPress={() => console.log("Cart pressed")}>

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
