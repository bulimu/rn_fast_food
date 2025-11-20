import CustomHeader from '@/components/CustomHeader';
import EmptyItem from '@/components/EmptyItem';
import OrderCard from '@/components/OrderCard';
import { images } from '@/constants';
import { useUserOrders } from '@/hooks/useOrderQueries';
import useAuthStore from '@/store/auth.store';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OrderHistory = () => {
  const { user } = useAuthStore();
  const { data: orders, isLoading, error, refetch } = useUserOrders(user?.$id || '');

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-base text-gray-600">Please sign in to view orders</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#FF9C01" />
        <Text className="text-base text-gray-500 mt-4">Loading your orders...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-5">
        <Image
          source={images.emptyState}
          className="w-32 h-32 mb-4"
          resizeMode="contain"
        />
        <Text className="text-xl font-bold text-dark-100 mb-2">Failed to Load</Text>
        <Text className="text-sm text-gray-500 text-center mb-6">
          Unable to load order history. Please try again.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-primary px-8 py-3 rounded-full"
        >
          <Text className="text-base font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-5 pb-3">
        <CustomHeader title="Order History" />
      </View>

      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => {
              // TODO: Navigate to order details
              console.log('View order:', item.$id);
            }}
          />
        )}
        keyExtractor={(item) => item.$id}
        contentContainerClassName="px-5 pb-5"
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-20">
            <EmptyItem
              title="No Orders Yet"
              description="You haven't placed any orders. Start shopping now!"
            />
          </View>
        )}
        refreshing={isLoading}
        onRefresh={refetch}
      />
    </SafeAreaView>
  );
};

export default OrderHistory;
