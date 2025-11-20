import {
  createOrder,
  createPaymentIntent,
  getOrderById,
  getOrdersByStatus,
  getUserOrders,
  updateOrderStatus
} from '@/lib/appwrite';
import { CreateOrderParams, Order } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// get user orders hook
export const useUserOrders = (userId: string) => {
  return useQuery({
    queryKey: ['orders', 'user', userId],
    queryFn: async () => {
      const result = await getUserOrders(userId);
      if (result.success) {
        return result.orders as unknown as Order[];
      }
      throw new Error(result.error || 'Failed to fetch orders');
    },
    enabled: !!userId,
  });
};

export const useOrderById = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      const result = await getOrderById(orderId);
      if (result.success) {
        return result.order as unknown as Order;
      }
      throw new Error(result.error || 'Failed to fetch order');
    },
    enabled: !!orderId,
  });
};


export const useOrdersByStatus = (status: string, limit?: number) => {
  return useQuery({
    queryKey: ['orders', 'status', status],
    queryFn: async () => {
      const result = await getOrdersByStatus(status, limit);
      if (result.success) {
        return result.orders as unknown as Order[];
      }
      throw new Error(result.error || 'Failed to fetch orders by status');
    },
    enabled: !!status,
  });
};


export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: CreateOrderParams) => {
      const result = await createOrder({
        userId: orderData.userId,
        items: orderData.items,
        totalAmount: orderData.items.reduce((total, item) => {
          const customizationsTotal = item.customizations?.reduce((sum, c) => sum + c.price, 0) || 0;
          return total + (item.price + customizationsTotal) * item.quantity;
        }, 0),
        deliveryAddressId: orderData.deliveryAddressId
      });
      
      return result; // Return the full result with success, order, and orderNumber
    },
    onSuccess: (result) => {
      if (result.success && result.order) {
        // update relevant query caches
        queryClient.invalidateQueries({ queryKey: ['orders', 'user', result.order.user_id] });
        queryClient.invalidateQueries({ queryKey: ['orders', 'status', 'pending'] });
      }
    },
  });
};

// update 
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      paymentStatus,
      paymentIntentId
    }: {
      orderId: string;
      status: string;
      paymentStatus?: string;
      paymentIntentId?: string;
    }) => {
      const result = await updateOrderStatus(orderId, status, paymentStatus, paymentIntentId);
      if (result.success && result.order) {
        return result.order as unknown as Order;
      }
      throw new Error(result.error || 'Failed to update order status');
    },
    onSuccess: (order: Order) => {
        // Update relevant query caches
      queryClient.invalidateQueries({ queryKey: ['orders', 'user', order.user_id] });
      queryClient.invalidateQueries({ queryKey: ['orders', order.$id] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'status'] });
    },
  });
};

  // Hook for creating payment intent
export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: async ({ amount, currency = 'usd' }: {
      amount: number;
      currency?: string;
    }) => {
      const result = await createPaymentIntent(amount, currency);
      if (result.success) {
        return {
          clientSecret: result.clientSecret,
          paymentIntentId: result.paymentIntentId,
        };
      }
      throw new Error(result.error || 'Failed to create payment intent');
    },
  });
};
