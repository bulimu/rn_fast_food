import { images } from '@/constants';
import { Order, OrderItem } from '@/types';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface OrderCardProps {
  order: Order & { items?: OrderItem[] };
  onPress?: () => void;
}

const statusStyles: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  confirmed: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e', label: 'Confirmed' },
  delivered: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e', label: 'Delivered' },
  pending: { bg: '#fef9c3', color: '#a16207', dot: '#eab308', label: 'Pending' },
  cancelled: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444', label: 'Cancelled' },
  preparing: { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6', label: 'Preparing' },
  ready: { bg: '#e0e7ff', color: '#4338ca', dot: '#6366f1', label: 'Ready' },
  delivering: { bg: '#f3e8ff', color: '#7e22ce', dot: '#a855f7', label: 'Delivering' },
  on_delivery: { bg: '#f3e8ff', color: '#7e22ce', dot: '#a855f7', label: 'On Delivery' },
};

const paymentStyles: Record<string, { color: string; label: string }> = {
  paid: { color: '#15803d', label: 'Paid' },
  unpaid: { color: '#ea580c', label: 'Unpaid' },
  failed: { color: '#dc2626', label: 'Failed' },
  refunded: { color: '#2563eb', label: 'Refunded' },
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      if (diffDay < 7) return `${diffDay}d ago`;

      const month = d.toLocaleString('en', { month: 'short' });
      const day = d.getDate();
      return `${month} ${day}`;
    } catch {
      return dateString;
    }
  };

  const status = statusStyles[order.status] || { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af', label: order.status };
  const payment = paymentStyles[order.payment_status] || { color: '#6b7280', label: order.payment_status };
  const items = order.items || [];
  const itemCount = items.length;

  // Build a short summary of item names
  const itemSummary = items.length > 0
    ? items.slice(0, 3).map(i => `${i.item_name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(', ')
      + (items.length > 3 ? ` +${items.length - 3} more` : '')
    : `${itemCount} item${itemCount !== 1 ? 's' : ''}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        backgroundColor: '#fff',
        borderRadius: 18,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      {/* Status accent bar at top */}
      <View style={{ height: 3, backgroundColor: status.dot }} />

      <View style={{ padding: 16 }}>
        {/* Top row: order number + date | status */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a' }}>
              #{order.order_number}
            </Text>
            <Text style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>
              {formatDate(order.$createdAt)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: status.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, gap: 5 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: status.dot }} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: status.color }}>{status.label}</Text>
          </View>
        </View>

        {/* Items summary */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fafafa',
            borderRadius: 12,
            padding: 12,
            marginBottom: 14,
          }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: '#FFF5EB',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Image source={images.bag} style={{ width: 17, height: 17, tintColor: '#FE8C00' }} />
          </View>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 13, color: '#555', lineHeight: 18 }} numberOfLines={2}>
              {itemSummary}
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#1a1a1a' }}>
            ${order.total_amount?.toFixed(2)}
          </Text>
        </View>

        {/* Bottom row: payment + actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: payment.color }} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: payment.color }}>{payment.label}</Text>
            {order.delivery_fee != null && order.delivery_fee > 0 && (
              <Text style={{ fontSize: 11, color: '#bbb', marginLeft: 6 }}>
                +${order.delivery_fee.toFixed(2)} delivery
              </Text>
            )}
          </View>

          {onPress && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#FE8C00' }}>Details</Text>
              <Image source={images.arrowRight} style={{ width: 12, height: 12, tintColor: '#FE8C00' }} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default OrderCard;
