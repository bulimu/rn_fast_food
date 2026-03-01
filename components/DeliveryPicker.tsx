import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { images } from '@/constants';
import { getAddresses } from '@/lib/appwrite';
import useAuthStore from '@/store/auth.store';
import { Address } from '@/types';

export default function DeliveryPicker() {
  const { user } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const fetchAddresses = useCallback(async () => {
    if (!user?.$id) return;
    try {
      const result = await getAddresses(user.$id);
      if (result.success && result.addresses) {
        const list = result.addresses as Address[];
        setAddresses(list);
        setSelectedAddress(prev => {
          if (prev) return prev;
          return list.find(a => a.isDefault) || list[0] || null;
        });
      }
    } catch (e) {
      console.error('Failed to fetch addresses:', e);
    }
  }, [user?.$id]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSelect = (addr: Address) => {
    setSelectedAddress(addr);
    setPickerVisible(false);
  };

  const deliveryLabel = selectedAddress
    ? selectedAddress.address
    : 'Set delivery address';

  return (
    <View className="flex-start flex-1 mr-3">
      <Text className="small-bold text-primary">DELIVER TO</Text>
      <TouchableOpacity
        className="flex-center flex-row gap-x-1 mt-0.5"
        onPress={() => {
          if (addresses.length > 0) {
            setPickerVisible(true);
          } else {
            router.push('/delivery-addresses');
          }
        }}
      >
        <Text className="paragraph-bold text-dark-100" numberOfLines={1}>
          {deliveryLabel}
        </Text>
        <Image source={images.arrowDown} className="size-3" resizeMode="contain" />
      </TouchableOpacity>

      {/* Address Picker Modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          onPress={() => setPickerVisible(false)}
        >
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 30,
              maxHeight: '60%',
            }}
          >
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#ddd' }} />
            </View>

            <Text style={{ fontSize: 18, fontWeight: '700', paddingHorizontal: 20, marginBottom: 12 }}>
              Select Delivery Address
            </Text>

            <FlatList
              data={addresses}
              keyExtractor={(item) => item.$id}
              renderItem={({ item }) => {
                const isSelected = selectedAddress?.$id === item.$id;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      backgroundColor: isSelected ? '#FFF5EB' : '#fff',
                      borderBottomWidth: 1,
                      borderBottomColor: '#f0f0f0',
                    }}
                  >
                    {/* Radio circle */}
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        borderWidth: 2,
                        borderColor: isSelected ? '#FE8C00' : '#ccc',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      {isSelected && (
                        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FE8C00' }} />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#1a1a1a' }}>
                          {item.title}
                        </Text>
                        {item.isDefault && (
                          <View style={{ backgroundColor: '#FE8C00', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }} numberOfLines={1}>
                        {item.address}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#999', marginTop: 1 }}>
                        {item.city}, {item.country}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={() => (
                <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                  <Text style={{ fontSize: 14, color: '#999' }}>No saved addresses</Text>
                </View>
              )}
            />

            {/* Manage addresses link */}
            <TouchableOpacity
              onPress={() => {
                setPickerVisible(false);
                router.push('/delivery-addresses');
              }}
              style={{
                marginTop: 10,
                marginHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: '#FE8C00',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                Manage Addresses
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
