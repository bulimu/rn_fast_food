import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { images } from '@/constants';
import { createAddress, deleteAddress, getAddresses, updateAddress } from '@/lib/appwrite';
import useAuthStore from '@/store/auth.store';
import { Address } from '@/types';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DeliveryAddresses = () => {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    isDefault: false,
  });

  const resetForm = () => {
    setFormData({ title: '', address: '', city: '', postalCode: '', country: '', isDefault: false });
    setEditingAddress(null);
  };

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const result = await getAddresses(user.$id);
      if (result.success && result.addresses) {
        setAddresses(result.addresses as unknown as Address[]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (address: Address) => {
    setFormData({
      title: address.title,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode || '',
      country: address.country,
      isDefault: address.isDefault ?? false,
    });
    setEditingAddress(address);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.title.trim() || !formData.address.trim() || !formData.city.trim() || !formData.country.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim(),
        isDefault: formData.isDefault,
      };

      const result = editingAddress
        ? await updateAddress({ addressId: editingAddress.$id, ...payload })
        : await createAddress({ userId: user.$id, ...payload });

      if (result.success) {
        setModalVisible(false);
        resetForm();
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Address submission error:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (address: Address) => {
    Alert.alert('Delete Address', `Are you sure you want to delete "${address.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await deleteAddress(address.$id);
            if (result.success) {
              await fetchAddresses();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete address');
            }
          } catch {
            Alert.alert('Error', 'Failed to delete address. Please try again.');
          }
        },
      },
    ]);
  };

  // ─── Address Card ─────────────────────────────────────────
  const renderAddressItem = ({ item }: { item: Address }) => (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 14,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Location icon */}
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: '#FFF5EB',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}
        >
          <Image source={images.location} style={{ width: 20, height: 20, tintColor: '#FE8C00' }} />
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a' }}>{item.title}</Text>
            {item.isDefault && (
              <View
                style={{
                  backgroundColor: '#FE8C00',
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>DEFAULT</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 14, color: '#555', lineHeight: 20 }}>{item.address}</Text>
          <Text style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
            {item.city}, {item.country}
            {item.postalCode ? ` · ${item.postalCode}` : ''}
          </Text>
        </View>
      </View>

      {/* Divider + Actions */}
      <View style={{ height: 1, backgroundColor: '#f3f3f3', marginVertical: 12 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }}>
        <TouchableOpacity
          onPress={() => openEditModal(item)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: '#f5f5f5',
            gap: 6,
          }}
        >
          <Image source={images.pencil} style={{ width: 14, height: 14, tintColor: '#666' }} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#555' }}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: '#fef2f2',
            gap: 6,
          }}
        >
          <Image source={images.trash} style={{ width: 14, height: 14, tintColor: '#ef4444' }} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#ef4444' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Loading / Not logged in ──────────────────────────────
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FE8C00" />
      </SafeAreaView>
    );
  }

  // ─── Main Screen ──────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
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
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#1a1a1a' }}>My Addresses</Text>
        </View>

        <TouchableOpacity
          onPress={openAddModal}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FE8C00',
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 9,
            gap: 5,
          }}
        >
          <Image source={images.plus} style={{ width: 14, height: 14, tintColor: '#fff' }} />
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FE8C00" />
            <Text style={{ marginTop: 12, fontSize: 14, color: '#999' }}>Loading addresses...</Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#FFF5EB',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Image source={images.location} style={{ width: 36, height: 36, tintColor: '#FE8C00' }} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 }}>
              No addresses yet
            </Text>
            <Text style={{ fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
              Add your first delivery address to get started with ordering
            </Text>
            <CustomButton title="Add Your First Address" onPress={openAddModal} />
          </View>
        ) : (
          <FlatList
            data={addresses}
            renderItem={renderAddressItem}
            keyExtractor={(item) => item.$id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </View>

      {/* ─── Add / Edit Modal ──────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => { setModalVisible(false); resetForm(); }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          onPress={() => { setModalVisible(false); resetForm(); }}
        >
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '85%',
            }}
          >
            {/* Handle bar */}
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#ddd' }} />
            </View>

            {/* Modal header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0',
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a1a' }}>
                {editingAddress ? 'Edit Address' : 'New Address'}
              </Text>
              <TouchableOpacity
                onPress={() => { setModalVisible(false); resetForm(); }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#f5f5f5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16, color: '#999', fontWeight: '600' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ paddingHorizontal: 20 }}
              contentContainerStyle={{ paddingTop: 20, paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <CustomInput
                label="Label"
                value={formData.title}
                placeholder="e.g. Home, Office, Gym…"
                onChangeText={(v) => handleInputChange('title', v)}
              />

              <View style={{ height: 14 }} />
              <CustomInput
                label="Street Address"
                value={formData.address}
                placeholder="123 Main Street, Apt 4B"
                onChangeText={(v) => handleInputChange('address', v)}
              />

              <View style={{ height: 14 }} />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <CustomInput
                    label="City"
                    value={formData.city}
                    placeholder="City"
                    onChangeText={(v) => handleInputChange('city', v)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <CustomInput
                    label="Postal Code"
                    value={formData.postalCode}
                    placeholder="Optional"
                    onChangeText={(v) => handleInputChange('postalCode', v)}
                  />
                </View>
              </View>

              <View style={{ height: 14 }} />
              <CustomInput
                label="Country"
                value={formData.country}
                placeholder="Country"
                onChangeText={(v) => handleInputChange('country', v)}
              />

              {/* Default toggle */}
              <TouchableOpacity
                onPress={() => handleInputChange('isDefault', !formData.isDefault)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 20,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  backgroundColor: formData.isDefault ? '#FFF5EB' : '#f8f8f8',
                  borderWidth: 1.5,
                  borderColor: formData.isDefault ? '#FE8C00' : '#e8e8e8',
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: formData.isDefault ? '#FE8C00' : '#ccc',
                    backgroundColor: formData.isDefault ? '#FE8C00' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                  }}
                >
                  {formData.isDefault && (
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold', lineHeight: 15 }}>✓</Text>
                  )}
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1a1a1a' }}>
                    Set as default address
                  </Text>
                  <Text style={{ fontSize: 12, color: '#999', marginTop: 1 }}>
                    Used automatically at checkout
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={{ marginTop: 24 }}>
                <CustomButton
                  title={editingAddress ? 'Update Address' : 'Save Address'}
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default DeliveryAddresses;
