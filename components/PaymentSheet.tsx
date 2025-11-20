import { useCreateOrder, useUpdateOrderStatus } from '@/hooks/useOrderQueries';
import { functions } from '@/lib/appwrite';
import useAuthStore from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { PriceCalculator } from '@/utils/PriceCalculator';
import { useStripe } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import CustomButton from './CustomButton';

interface PaymentSheetProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PaymentSheet: React.FC<PaymentSheetProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { selectedItems, items, clearCart } = useCartStore();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Use mutations
  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrderStatus();

  const selectedCartItems = items.filter(item =>
    selectedItems.includes(item._key || '')
  );

  const totalAmount = selectedCartItems.reduce((total, item) => {
    const customizations = item.customizations?.map(c => ({
      ...c,
      quantity: 1
    })) || [];

    return total + PriceCalculator.calculateTotalPrice(item.price, item.quantity, customizations);
  }, 0);

  const DELIVERY_FEE = 0.00;
  const DISCOUNT = 0.50;
  const finalTotal = totalAmount + DELIVERY_FEE - DISCOUNT;

  const handlePayment = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in first');
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Step 1: Creating order...');

      // 1. Prepare order data
      const orderItems = selectedCartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        quantity: item.quantity,
        customizations: item.customizations?.map(c => ({
          id: c.id,
          name: c.name,
          price: c.price,
          type: c.type,
          quantity: c.quantity || 1
        })) || []
      }));

      const orderResult = await createOrderMutation.mutateAsync({
        userId: user.$id,
        items: orderItems,
        totalAmount: finalTotal,
        deliveryAddressId: undefined
      });

      if (!orderResult.success || !orderResult.order) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      const order = orderResult.order;
      console.log('✅ Order created:', order.$id);

      // 2. Call cloud function to create PaymentIntent
      console.log('🔄 Step 2: Creating PaymentIntent...');
      const response = await functions.createExecution(
        '69050b89001d7527ff03',
        JSON.stringify({
          amount: Math.round(finalTotal * 100),
          currency: 'usd',
          orderId: order.$id,
          customerEmail: user.email
        })
      );

      console.log('📦 Function response:', response);

      if (response.status !== 'completed') {
        throw new Error(`Function execution failed with status: ${response.status}`);
      }

      const responseData = JSON.parse(response.responseBody);
      console.log('📦 Response data:', responseData);

      const { clientSecret, paymentIntentId, error: paymentError } = responseData;

      if (paymentError) {
        throw new Error(paymentError);
      }

      if (!clientSecret) {
        throw new Error('No client secret received from server');
      }

      console.log('✅ PaymentIntent created:', paymentIntentId);

      // 3. Initialize Payment Sheet
      console.log('🔄 Step 3: Initializing Payment Sheet...');
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Fast Food App',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          name: user.name,
          email: user.email,
        },
        returnURL: 'fastfood://payment-complete',
      });

      if (initError) {
        console.error('❌ Init error:', initError);
        throw new Error(initError.message);
      }

      console.log('✅ Payment Sheet initialized');

      // 4. Present Payment Sheet
      console.log('🔄 Step 4: Presenting Payment Sheet...');
      const { error: presentError } = await presentPaymentSheet();

      console.log('✅ Payment Sheet presented');

      if (presentError) {
        console.log('❌ Present error:', presentError);
        // User cancelled payment
        if (presentError.code === 'Canceled') {
          await updateOrderMutation.mutateAsync({
            orderId: order.$id,
            status: 'cancelled',
            paymentStatus: 'unpaid',
            paymentIntentId: paymentIntentId
          });
          Alert.alert('Payment Cancelled', 'You can complete payment later');
        } else {
          // Payment failed
          await updateOrderMutation.mutateAsync({
            orderId: order.$id,
            status: 'cancelled',
            paymentStatus: 'failed',
            paymentIntentId: paymentIntentId
          });
          Alert.alert('Payment Failed', presentError.message);
        }
      } else {
        // 5. Payment successful
        console.log('✅ Payment successful');
        await updateOrderMutation.mutateAsync({
          orderId: order.$id,
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentIntentId: paymentIntentId
        });

        clearCart();

        Alert.alert(
          'Payment Successful!',
          `Order #${orderResult.orderNumber}\nYour order has been placed`,
          [
            {
              text: 'OK',
              onPress: () => onSuccess?.()
            }
          ]
        );
      }

    } catch (error: any) {
      console.error('❌ Payment error:', error);

      // Provide more detailed error message
      let errorMessage = 'Please try again';
      if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(
        'Payment Error',
        errorMessage,
        [
          {
            text: 'OK',
            onPress: () => setLoading(false)
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="p-5 bg-white rounded-t-3xl">
      <Text className="text-xl font-bold text-center mb-4">Confirm Payment</Text>

      <View className="mb-4">
        <Text className="text-gray-600 mb-2">Order Summary:</Text>
        {selectedCartItems.map((item) => (
          <View key={item._key} className="flex-row justify-between py-1">
            <Text className="flex-1">{item.name} x{item.quantity}</Text>
            <Text className="font-semibold">
              ${PriceCalculator.calculateTotalPrice(
                item.price,
                item.quantity,
                item.customizations?.map(c => ({ ...c, quantity: 1 })) || []
              ).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View className="border-t border-gray-200 pt-4 mb-6">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Subtotal:</Text>
          <Text className="text-gray-600">${totalAmount.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Delivery Fee:</Text>
          <Text className="text-gray-600">${DELIVERY_FEE.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Discount:</Text>
          <Text className="text-green-600">-${DISCOUNT.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between pt-2 border-t border-gray-100">
          <Text className="text-lg font-bold">Total:</Text>
          <Text className="text-lg font-bold">${finalTotal.toFixed(2)}</Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <CustomButton
          title="Cancel"
          onPress={onCancel}
          style="flex-1 bg-gray-200"
          textStyle="text-gray-700"
        />
        <CustomButton
          title={`Pay $${finalTotal.toFixed(2)}`}
          onPress={handlePayment}
          style="flex-1"
          isLoading={loading}
        />
      </View>
    </View>
  );
};

export default PaymentSheet;
