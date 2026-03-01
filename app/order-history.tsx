import EmptyItem from '@/components/EmptyItem';
import OrderCard from '@/components/OrderCard';
import { images } from '@/constants';
import { useUserOrders } from '@/hooks/useOrderQueries';
import useAuthStore from '@/store/auth.store';
import { Order } from '@/types';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
] as const;

type FilterKey = typeof FILTERS[number]['key'];

const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'on_delivery'];

const OrderHistory = () => {
  const { user } = useAuthStore();
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserOrders(user?.$id || '');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  // Flatten all pages into a single array
  const orders = useMemo(
    () => data?.pages.flatMap((p) => p.orders) ?? [],
    [data]
  );

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    switch (activeFilter) {
      case 'active':
        return orders.filter(o => ACTIVE_STATUSES.includes(o.status));
      case 'delivered':
        return orders.filter(o => o.status === 'delivered');
      case 'cancelled':
        return orders.filter(o => o.status === 'cancelled');
      default:
        return orders;
    }
  }, [orders, activeFilter]);

  // Count badges per filter
  const counts = useMemo(() => {
    if (!orders) return { all: 0, active: 0, delivered: 0, cancelled: 0 };
    return {
      all: orders.length,
      active: orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  }, [orders]);

  // ─── Loading / Auth / Error states ──────────────────────
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FE8C00" />
        <Text style={{ fontSize: 14, color: '#999', marginTop: 12 }}>Please sign in to view orders</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FE8C00" />
        <Text style={{ fontSize: 14, color: '#999', marginTop: 12 }}>Loading your orders...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: '#fef2f2',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 28 }}>!</Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 }}>
          Failed to Load
        </Text>
        <Text style={{ fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
          Unable to load order history. Please try again.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={{ backgroundColor: '#FE8C00', borderRadius: 50, paddingHorizontal: 32, paddingVertical: 12 }}
        >
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ─── Main ──────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: '#f5f5f5',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Image source={images.arrowBack} style={{ width: 18, height: 18, tintColor: '#333' }} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1a1a1a' }}>Order History</Text>
          </View>
          {orders && orders.length > 0 && (
            <Text style={{ fontSize: 13, color: '#bbb' }}>
              {orders.length} total
            </Text>
          )}
        </View>

        {/* Filter tabs */}
        {orders && orders.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 14, gap: 8 }}
          >
            {FILTERS.map(f => {
              const isActive = activeFilter === f.key;
              const count = counts[f.key];
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setActiveFilter(f.key)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isActive ? '#FE8C00' : '#f5f5f5',
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: isActive ? '#fff' : '#777',
                    }}
                  >
                    {f.label}
                  </Text>
                  {count > 0 && (
                    <View
                      style={{
                        backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#e5e5e5',
                        borderRadius: 10,
                        minWidth: 20,
                        height: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 5,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: isActive ? '#fff' : '#999' }}>
                        {count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Orders list */}
      <FlatList
        data={filteredOrders}
        renderItem={({ item }) => (
          <OrderCard
            order={item as Order & { items?: any[] }}
            onPress={() => {
              console.log('View order:', item.$id);
            }}
          />
        )}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage && activeFilter === 'all') {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#FE8C00" />
            </View>
          ) : null
        }
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            {activeFilter !== 'all' ? (
              <>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: '#FFF5EB',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Image source={images.bag} style={{ width: 28, height: 28, tintColor: '#FE8C00' }} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 }}>
                  No {FILTERS.find(f => f.key === activeFilter)?.label.toLowerCase()} orders
                </Text>
                <Text style={{ fontSize: 13, color: '#999' }}>
                  Try a different filter
                </Text>
              </>
            ) : (
              <EmptyItem
                title="No Orders Yet"
                description="You haven't placed any orders. Start shopping now!"
              />
            )}
          </View>
        )}
        refreshing={isLoading}
        onRefresh={refetch}
      />
    </SafeAreaView>
  );
};

export default OrderHistory;
