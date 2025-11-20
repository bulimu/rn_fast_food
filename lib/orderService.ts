import { appwriteConfig, databases } from '@/lib/appwrite';
import { Address, CreateOrderParams, Order, OrderItem, OrderItemCustomization } from '@/types';
import { PriceCalculator } from '@/utils/PriceCalculator';
import { ID, Query } from 'react-native-appwrite';

export const orderService = {
  // Create a new order
  async createOrder(params: CreateOrderParams): Promise<Order> {
    try {
      const { userId, items, deliveryAddressId, customerNotes } = params;
      
      // Calculate total amount using PriceCalculator
      const totalAmount = items.reduce((total, item) => {
        const customizations = (item.customizations || []).map(c => ({
          ...c,
          quantity: c.quantity || 1
        }));
        return total + PriceCalculator.calculateTotalPrice(item.price, item.quantity, customizations);
      }, 0);

      // Create order main record
      const order = await databases.createDocument(
        appwriteConfig.databaseId,
        'orders',
        ID.unique(),
        {
          user_id: userId,
          order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          status: 'pending', // Explicitly set required enum value
          payment_status: 'unpaid', // Explicitly set required enum value
          total_amount: totalAmount,
          delivery_address_id: deliveryAddressId,
          customer_notes: customerNotes,
          estimated_delivery_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
          tax_amount: totalAmount * 0.1, // 10% tax
          delivery_fee: deliveryAddressId ? 3.99 : 0, // Delivery fee if address is provided
        }
      ) as Order;

      // Create order items
      for (const item of items) {
        const itemSubtotal = item.price * item.quantity;
        
        const orderItem = await databases.createDocument(
          appwriteConfig.databaseId,
          'order_items',
          ID.unique(),
          {
            order_id: order.$id,
            menu_item_id: item.id,
            item_name: item.name,
            item_price: item.price,
            quantity: item.quantity,
            subtotal: itemSubtotal
          }
        ) as OrderItem;

        // Create customization records
        if (item.customizations && item.customizations.length > 0) {
          for (const custom of item.customizations) {
            await databases.createDocument(
              appwriteConfig.databaseId,
              'order_item_customizations',
              ID.unique(),
              {
                order_item_id: orderItem.$id,
                customization_id: custom.id,
                customization_name: custom.name,
                customization_price: custom.price,
                customization_type: custom.type,
                quantity: custom.quantity || 1
              }
            );
          }
        }
      }

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Update payment status
  async updatePaymentStatus(
    orderId: string, 
    paymentIntentId: string, 
    status: 'paid' | 'failed'
  ): Promise<Order> {
    try {
      return await databases.updateDocument(
        appwriteConfig.databaseId,
        'orders',
        orderId,
        {
          payment_status: status,
          payment_intent_id: paymentIntentId,
          status: status === 'paid' ? 'confirmed' : 'cancelled'
        }
      ) as Order;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  // Get user orders with delivery address details
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        'orders',
        [
          Query.equal('user_id', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(20)
        ]
      );
      
      return response.documents as Order[];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // Get order details with items and customizations
  async getOrderDetails(orderId: string): Promise<{
    order: Order;
    items: OrderItem[];
    customizations: { [orderItemId: string]: OrderItemCustomization[] };
    deliveryAddress?: Address;
  }> {
    try {
      // Get order
      const order = await databases.getDocument(
        appwriteConfig.databaseId,
        'orders',
        orderId
      ) as Order;

      // Get order items
      const itemsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        'order_items',
        [Query.equal('order_id', orderId)]
      );
      const items = itemsResponse.documents as OrderItem[];

      // Get customizations for all items
      const customizations: { [orderItemId: string]: OrderItemCustomization[] } = {};
      for (const item of items) {
        const customResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          'order_item_customizations',
          [Query.equal('order_item_id', item.$id)]
        );
        customizations[item.$id] = customResponse.documents as OrderItemCustomization[];
      }

      // Get delivery address if exists
      let deliveryAddress: Address | undefined;
      if (order.delivery_address_id) {
        try {
          if (typeof order.delivery_address_id === 'string') {
            deliveryAddress = await databases.getDocument(
              appwriteConfig.databaseId,
              'addresses',
              order.delivery_address_id
            ) as Address;
          } else {
            deliveryAddress = order.delivery_address_id;
          }
        } catch (error) {
          console.warn('Could not fetch delivery address:', error);
        }
      }

      return {
        order,
        items,
        customizations,
        deliveryAddress
      };
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(
    orderId: string, 
    status: Order['status']
  ): Promise<Order> {
    try {
      return await databases.updateDocument(
        appwriteConfig.databaseId,
        'orders',
        orderId,
        { status }
      ) as Order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};
