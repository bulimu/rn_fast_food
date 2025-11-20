import CartItem from "@/components/CartItem";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import EmptyItem from '@/components/EmptyItem';
import PaymentSheet from '@/components/PaymentSheet';
import { images } from "@/constants";
import { useCartStore } from "@/store/cart.store";
import { PaymentInfoStripeProps } from '@/types';
import cn from "clsx";
import { useRef } from 'react';
import { Alert, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentInfoStripe = ({ label, value, labelStyle, valueStyle, }: PaymentInfoStripeProps) => (
  <View className="flex-between flex-row my-1">
    <Text className={cn("paragraph-medium text-gray-200", labelStyle)}>
      {label}
    </Text>
    <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>
      {value}
    </Text>
  </View>
);

const Cart = () => {
  const {
    items,
    selectedItems,
    getTotalItems,
    getTotalPrice,
    getSelectedTotalItems,
    getSelectedTotalPrice,
    selectAllItems,
    deselectAllItems
  } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const selectedTotalItems = getSelectedTotalItems();
  const selectedTotalPrice = getSelectedTotalPrice();

  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const hasSelectedItems = selectedItems.length > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      deselectAllItems();
    } else {
      selectAllItems();
    }
  };
  const paymentSheetRef = useRef<any>(null);

  const handleOrderNow = () => {
    if (!hasSelectedItems) {
      Alert.alert('Tip', 'Please select items to checkout');
      return;
    }
    paymentSheetRef.current?.open();
  };

  const handlePaymentSuccess = () => {
    paymentSheetRef.current?.close();

    Alert.alert(
      'Payment Successful',
      'Order created! Returning to home',
      [
        {
          text: 'OK',
          /*  onPress: () => {
             router.push('/(tabs)/cart');
           } */
        }
      ],
      { cancelable: false }
    );
  };


  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={items}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => item._key!}
        contentContainerClassName="pb-28 px-5 pt-5"
        ListHeaderComponent={() => (
          <View>
            <CustomHeader title="Your Cart" />
            {items.length > 0 && (
              <TouchableOpacity
                onPress={handleSelectAll}
                className="flex-row items-center py-3 mb-2"
              >
                <View className={`w-6 h-6 border-2 rounded mr-3 ${allSelected ? 'bg-primary border-primary' : 'border-gray-300'} flex-center`}>
                  {allSelected && (
                    // <Text className="text-white text-xs font-bold">✓</Text>
                    <Image
                      source={images.check}
                      className="w-3 h-3"
                      resizeMode="contain"
                      tintColor="white"
                    />
                  )}
                </View>
                <Text className="base-medium text-dark-100">
                  {allSelected ? 'Deselect All' : 'Select All'} ({selectedItems.length}/{items.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={() => <EmptyItem title=' Your cart is empty' description='Browse the menu and add items you love!' />}
        ListFooterComponent={() => hasSelectedItems && (
          <View className="gap-5">
            <View className="mt-6 border border-gray-200 p-5 rounded-2xl">
              <Text className="h3-bold text-dark-100 mb-5">
                Payment Summary
              </Text>

              <PaymentInfoStripe
                label={`Selected Items (${selectedTotalItems})`}
                value={`$${selectedTotalPrice.toFixed(2)}`}
              />

              {selectedItems.length < items.length && (
                <PaymentInfoStripe
                  label={`Total Items (${totalItems})`}
                  value={`$${totalPrice.toFixed(2)}`}
                  labelStyle="!text-gray-400"
                  valueStyle="!text-gray-400"
                />
              )}

              <PaymentInfoStripe
                label={`Delivery Fee`}
                value={`$0.00`}
              />
              <PaymentInfoStripe
                label={`Discount`}
                value={`- $0.50`}
                valueStyle="!text-success"
              />
              <View className="border-t border-gray-300 my-2" />
              <PaymentInfoStripe
                label={`Total`}
                value={`$${(selectedTotalPrice + 0 - 0.5).toFixed(2)}`}
                labelStyle="base-bold !text-dark-100"
                valueStyle="base-bold !text-dark-100 !text-right"
              />
            </View>

            <CustomButton
              title={`Order Now (${selectedTotalItems} items)`}
              onPress={handleOrderNow}
            />
          </View>
        )}
      />

      <RBSheet
        ref={paymentSheetRef}
        height={500}
        draggable={true}
        customStyles={{
          container: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          },
          draggableIcon: {
            backgroundColor: "#000"
          }
        }}
      >
        <PaymentSheet
          onSuccess={handlePaymentSuccess}
          onCancel={() => paymentSheetRef.current?.close()}
        />
      </RBSheet>


    </SafeAreaView>
  )
}

export default Cart