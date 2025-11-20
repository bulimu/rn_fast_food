import { images } from '@/constants';
import { Order } from '@/types';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
      delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Delivered' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
      preparing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Preparing' },
      on_delivery: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'On Delivery' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: status,
    };

    return (
      <View className={`px-3 py-1.5 rounded-full ${config.bg}`}>
        <Text className={`text-xs font-semibold ${config.text}`}>
          {config.label}
        </Text>
      </View>
    );
  };

  const getPaymentBadge = (status: string) => {
    const paymentConfig = {
      paid: { text: 'text-green-600', label: 'Paid' },
      unpaid: { text: 'text-orange-600', label: 'Unpaid' },
      failed: { text: 'text-red-600', label: 'Failed' },
      refunded: { text: 'text-blue-600', label: 'Refunded' },
    };

    const config = paymentConfig[status as keyof typeof paymentConfig] || {
      text: 'text-gray-600',
      label: status,
    };

    return (
      <Text className={`text-sm font-semibold ${config.text}`}>
        {config.label}
      </Text>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const month = date.toLocaleString('en', { month: 'short' });
      const day = date.getDate();
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month} ${day}, ${year} • ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  const itemCount = order.items?.length || 0;

  return (
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 mr-3">
          <Text className="text-base font-bold text-dark-100 mb-1">
            #{order.order_number}
          </Text>
          <Text className="text-sm text-gray-500">
            {formatDate(order.$createdAt)}
          </Text>
        </View>
        {getStatusBadge(order.status)}
      </View>

      {/* Items Count */}
      <View className="flex-row items-center mb-4 py-3 px-4 bg-gray-50 rounded-xl">
        <Image
          source={images.bag}
          className="w-5 h-5 mr-3"
          resizeMode="contain"
          tintColor="#6B7280"
        />
        <Text className="text-sm text-gray-600 flex-1">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Text>
        <Text className="text-lg font-bold text-dark-100">
          ${order.total_amount?.toFixed(2)}
        </Text>
      </View>

      {/* Payment Status */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-sm text-gray-600">Payment Status</Text>
        {getPaymentBadge(order.payment_status)}
      </View>

      {/* View Details Button */}
      {onPress && (
        <TouchableOpacity
          onPress={onPress}
          className="bg-primary/10 rounded-xl py-3 items-center active:bg-primary/20"
        >
          <Text className="text-base font-semibold text-primary">View Details</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default OrderCard;
