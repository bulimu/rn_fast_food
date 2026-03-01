import { useCreateOrder, useUpdateOrderStatus } from "@/hooks/useOrderQueries";
import { functions } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { CartItemType } from "@/types";
import { PriceCalculator } from "@/utils/PriceCalculator";
import { useStripe } from "@stripe/stripe-react-native";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import CustomButton from "./CustomButton";

// --- Constants ---
const CLOUD_FUNCTION_ID = "69050b89001d7527ff03";

// --- Types ---
interface PaymentSheetProps {
  deliveryFee?: number;
  discount?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type PaymentStep = "idle" | "creating-order" | "creating-payment" | "processing" | "done";

const STEP_LABELS: Record<PaymentStep, string> = {
  idle: "",
  "creating-order": "Creating order...",
  "creating-payment": "Setting up payment...",
  processing: "Processing payment...",
  done: "Payment complete!",
};

// --- Helper ---
function calcItemPrice(item: CartItemType): number {
  const customizations =
    item.customizations?.map((c) => ({ ...c, quantity: c.quantity || 1 })) || [];
  return PriceCalculator.calculateTotalPrice(item.price, item.quantity, customizations);
}

// --- Component ---
const PaymentSheet: React.FC<PaymentSheetProps> = ({
  deliveryFee = 0,
  discount = 0.5,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<PaymentStep>("idle");

  const { user } = useAuthStore();
  const { getSelectedItems, clearSelectedItems } = useCartStore();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrderStatus();

  const selectedCartItems = getSelectedItems();

  const subtotal = useMemo(
    () => selectedCartItems.reduce((sum, item) => sum + calcItemPrice(item), 0),
    [selectedCartItems]
  );

  const finalTotal = Math.max(subtotal + deliveryFee - discount, 0);

  // --- Payment Flow ---
  const handlePayment = async () => {
    if (!user) {
      Alert.alert("Error", "Please sign in first");
      return;
    }

    if (selectedCartItems.length === 0) {
      Alert.alert("Error", "No items selected");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order in database
      setStep("creating-order");
      const orderItems = selectedCartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        quantity: item.quantity,
        customizations:
          item.customizations?.map((c) => ({
            id: c.id,
            name: c.name,
            price: c.price,
            type: c.type,
            quantity: c.quantity || 1,
          })) || [],
      }));

      const orderResult = await createOrderMutation.mutateAsync({
        userId: user.$id,
        items: orderItems,
        totalAmount: finalTotal,
        deliveryAddressId: undefined,
      });

      if (!orderResult.success || !orderResult.order) {
        throw new Error(orderResult.error || "Failed to create order");
      }

      const order = orderResult.order;

      // Step 2: Create PaymentIntent via cloud function
      setStep("creating-payment");
      const response = await functions.createExecution(
        CLOUD_FUNCTION_ID,
        JSON.stringify({
          amount: Math.round(finalTotal * 100), // Stripe expects cents
          currency: "usd",
          orderId: order.$id,
          customerEmail: user.email,
        })
      );

      if (response.status !== "completed") {
        throw new Error(`Payment service error (status: ${response.status})`);
      }

      const responseData = JSON.parse(response.responseBody);
      const { clientSecret, paymentIntentId, error: paymentError } = responseData;

      if (paymentError) throw new Error(paymentError);
      if (!clientSecret) throw new Error("No client secret received from server");

      // Step 3: Initialize & Present Stripe Payment Sheet
      setStep("processing");

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Fast Food App",
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          name: user.name,
          email: user.email,
        },
        returnURL: "fastfood://payment-complete",
      });

      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // User cancelled or payment failed
        const isCancelled = presentError.code === "Canceled";
        await updateOrderMutation.mutateAsync({
          orderId: order.$id,
          status: "cancelled",
          paymentStatus: isCancelled ? "unpaid" : "failed",
          paymentIntentId,
        });

        Alert.alert(
          isCancelled ? "Payment Cancelled" : "Payment Failed",
          isCancelled ? "You can complete payment later" : presentError.message
        );
        return;
      }

      // Step 4: Payment successful
      setStep("done");
      await updateOrderMutation.mutateAsync({
        orderId: order.$id,
        status: "confirmed",
        paymentStatus: "paid",
        paymentIntentId,
      });

      // Only clear the selected items, keep unselected items in cart
      clearSelectedItems();

      Alert.alert(
        "Payment Successful!",
        `Order #${orderResult.orderNumber}\nYour order has been placed`,
        [{ text: "OK", onPress: () => onSuccess?.() }]
      );
    } catch (error: any) {
      console.error("Payment error:", error);
      Alert.alert("Payment Error", error.message || "Please try again");
    } finally {
      setLoading(false);
      setStep("idle");
    }
  };

  // --- Render ---
  return (
    <ScrollView className="p-5 bg-white" contentContainerStyle={{ paddingBottom: 30 }}>
      <Text className="text-xl font-bold text-center mb-4">Confirm Payment</Text>

      {/* Order Items */}
      <View className="mb-4">
        <Text className="text-gray-600 mb-2 font-semibold">Order Summary</Text>
        {selectedCartItems.map((item) => (
          <View key={item._key} className="flex-row justify-between py-1.5">
            <View className="flex-1 mr-2">
              <Text className="text-dark-100" numberOfLines={1}>
                {item.name} x{item.quantity}
              </Text>
              {item.customizations && item.customizations.length > 0 && (
                <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>
                  {item.customizations.map((c) => c.name).join(", ")}
                </Text>
              )}
            </View>
            <Text className="font-semibold text-dark-100">
              {PriceCalculator.formatPrice(calcItemPrice(item))}
            </Text>
          </View>
        ))}
      </View>

      {/* Price Breakdown */}
      <View className="border-t border-gray-200 pt-4 mb-6">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Subtotal</Text>
          <Text className="text-gray-600">{PriceCalculator.formatPrice(subtotal)}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Delivery Fee</Text>
          <Text className="text-gray-600">{PriceCalculator.formatPrice(deliveryFee)}</Text>
        </View>
        {discount > 0 && (
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Discount</Text>
            <Text className="text-green-600">-{PriceCalculator.formatPrice(discount)}</Text>
          </View>
        )}
        <View className="border-t border-gray-100 mt-1 pt-3">
          <View className="flex-row justify-between">
            <Text className="text-lg font-bold text-dark-100">Total</Text>
            <Text className="text-lg font-bold text-primary">
              {PriceCalculator.formatPrice(finalTotal)}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress indicator */}
      {loading && (
        <View className="flex-row items-center justify-center mb-4 py-2 bg-orange-50 rounded-xl">
          <ActivityIndicator size="small" color="#FE8C00" />
          <Text className="ml-2 text-primary font-medium">{STEP_LABELS[step]}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <CustomButton
          title="Cancel"
          onPress={onCancel}
          style="flex-1 bg-gray-200"
          textStyle="text-gray-700"
        />
        <CustomButton
          title={`Pay ${PriceCalculator.formatPrice(finalTotal)}`}
          onPress={handlePayment}
          style="flex-1"
          isLoading={loading}
        />
      </View>
    </ScrollView>
  );
};

export default PaymentSheet;