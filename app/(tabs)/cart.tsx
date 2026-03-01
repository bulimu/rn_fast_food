import CartItem from "@/components/CartItem";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import EmptyItem from "@/components/EmptyItem";
import PaymentSheet from "@/components/PaymentSheet";
import { images } from "@/constants";
import { useCartStore } from "@/store/cart.store";
import { PaymentInfoStripeProps } from "@/types";
import cn from "clsx";
import React, { useState } from "react";
import { Alert, FlatList, Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Constants ---
const DELIVERY_FEE = 0.0;
const DISCOUNT = 0.5;

// --- Sub-components ---

const SummaryRow = ({ label, value, labelStyle, valueStyle }: PaymentInfoStripeProps) => (
  <View className="flex-between flex-row my-1">
    <Text className={cn("paragraph-medium text-gray-200", labelStyle)}>{label}</Text>
    <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>{value}</Text>
  </View>
);

// --- Main Component ---

const Cart = () => {
  const {
    items,
    selectedItems,
    getTotalItems,
    getTotalPrice,
    getSelectedTotalItems,
    getSelectedTotalPrice,
    selectAllItems,
    deselectAllItems,
  } = useCartStore();

  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const selectedTotalItems = getSelectedTotalItems();
  const selectedTotalPrice = getSelectedTotalPrice();

  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const hasSelectedItems = selectedItems.length > 0;

  const finalTotal = Math.max(selectedTotalPrice + DELIVERY_FEE - DISCOUNT, 0);

  const handleSelectAll = () => {
    if (allSelected) {
      deselectAllItems();
    } else {
      selectAllItems();
    }
  };

  const handleOrderNow = () => {
    if (!hasSelectedItems) {
      Alert.alert("Tip", "Please select items to checkout");
      return;
    }
    setIsPaymentSheetOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentSheetOpen(false);
    Alert.alert("Payment Successful", "Order created! Returning to home", [{ text: "OK" }], {
      cancelable: false,
    });
  };

  // --- List sections ---

  const renderHeader = () => (
    <View>
      <CustomHeader title="Your Cart" />
      {items.length > 0 && (
        <TouchableOpacity
          onPress={handleSelectAll}
          className="flex-row items-center py-3 mb-2"
          activeOpacity={0.7}
        >
          <View
            className={`w-6 h-6 border-2 rounded mr-3 ${
              allSelected ? "bg-primary border-primary" : "border-gray-300"
            } flex-center`}
          >
            <Image
              source={images.check}
              style={{ width: 14, height: 14, tintColor: "#fff", opacity: allSelected ? 1 : 0 }}
              resizeMode="contain"
            />
          </View>
          <Text className="base-medium text-dark-100">
            {allSelected ? "Deselect All" : "Select All"} ({selectedItems.length}/{items.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!hasSelectedItems) return null;

    return (
      <View className="gap-5">
        {/* Payment Summary Card */}
        <View className="mt-6 border border-gray-200 p-5 rounded-2xl">
          <Text className="h3-bold text-dark-100 mb-5">Payment Summary</Text>

          <SummaryRow
            label={`Selected Items (${selectedTotalItems})`}
            value={`$${selectedTotalPrice.toFixed(2)}`}
          />

          {selectedItems.length < items.length && (
            <SummaryRow
              label={`Total Items (${totalItems})`}
              value={`$${totalPrice.toFixed(2)}`}
              labelStyle="!text-gray-400"
              valueStyle="!text-gray-400"
            />
          )}

          <SummaryRow label="Delivery Fee" value={`$${DELIVERY_FEE.toFixed(2)}`} />

          <SummaryRow
            label="Discount"
            value={`-$${DISCOUNT.toFixed(2)}`}
            valueStyle="!text-success"
          />

          <View className="border-t border-gray-300 my-2" />

          <SummaryRow
            label="Total"
            value={`$${finalTotal.toFixed(2)}`}
            labelStyle="base-bold !text-dark-100"
            valueStyle="base-bold !text-dark-100 !text-right"
          />
        </View>

        <CustomButton
          title={`Order Now (${selectedTotalItems} items)`}
          onPress={handleOrderNow}
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={items}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => item._key!}
        contentContainerClassName="pb-28 px-5 pt-5"
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyItem
            title="Your cart is empty"
            description="Browse the menu and add items you love!"
          />
        }
        ListFooterComponent={renderFooter}
      />

      {/* Payment Bottom Sheet Modal */}
      <Modal
        visible={isPaymentSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPaymentSheetOpen(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
          activeOpacity={1}
          onPress={() => setIsPaymentSheetOpen(false)}
        />
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "70%",
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: "#ccc",
              borderRadius: 2,
              alignSelf: "center",
              marginTop: 10,
              marginBottom: 4,
            }}
          />
          <PaymentSheet
            deliveryFee={DELIVERY_FEE}
            discount={DISCOUNT}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setIsPaymentSheetOpen(false)}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Cart;