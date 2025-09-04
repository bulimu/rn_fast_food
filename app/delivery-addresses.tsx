import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { createAddress, deleteAddress, getAddresses, updateAddress } from '@/lib/appwrite';
import useAuthStore from '@/store/auth.store';
import { Address } from '@/types';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
    setFormData({
      title: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      isDefault: false,
    });
    setEditingAddress(null);
  };

  const fetchAddresses = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const result = await getAddresses(user.$id);

      if (result.success && result.addresses) {
        setAddresses(result.addresses as unknown as Address[]);
      } else {
        console.error('Failed to fetch addresses:', result.error);
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      let result;

      if (editingAddress) {
        result = await updateAddress({
          addressId: editingAddress.$id,
          title: formData.title.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country.trim(),
          isDefault: formData.isDefault,
        });
      } else {
        result = await createAddress({
          userId: user.$id,
          title: formData.title.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country.trim(),
          isDefault: formData.isDefault,
        });
      }

      if (result.success) {
        setModalVisible(false);
        resetForm();
        await fetchAddresses(); // Refresh the list

        Alert.alert(
          'Success',
          editingAddress ? 'Address updated successfully!' : 'Address added successfully!'
        );
      }
    } catch (error) {
      console.error('Address submission error:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (address: Address) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${address.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteAddress(address.$id);

              if (result.success) {
                await fetchAddresses(); // Refresh the list
                Alert.alert('Success', 'Address deleted successfully!');
              } else {
                Alert.alert('Error', result.error || 'Failed to delete address');
              }
            } catch (error) {
              console.error('Delete address error:', error);
              Alert.alert('Error', 'Failed to delete address. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="h3-bold text-dark-100 mb-1">{item.title}</Text>
          {item.isDefault && (
            <View className="bg-primary rounded-full px-2 py-1 self-start mb-2">
              <Text className="text-white text-xs font-semibold">Default</Text>
            </View>
          )}
          <Text className="paragraph-regular text-gray-600">{item.address}</Text>
          <Text className="paragraph-regular text-gray-600">
            {item.city}, {item.country} {item.postalCode}
          </Text>
        </View>

        <View className="flex-row ml-4">
          <TouchableOpacity
            onPress={() => openEditModal(item)}
            className="p-2 mr-2"
          >
            <Image
              source={require('@/assets/icons/pencil.png')}
              className="w-5 h-5"
              tintColor="#666"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(item)}
            className="p-2"
          >
            <Image
              source={require('@/assets/icons/trash.png')}
              className="w-5 h-5"
              tintColor="#ef4444"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="paragraph-medium text-center">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 mr-3"
            >
              <Image
                source={require('@/assets/icons/arrow-back.png')}
                className="w-6 h-6"
                tintColor="#333"
              />
            </TouchableOpacity>
            <View>
              <Text className="h2-bold text-dark-100">Delivery Addresses</Text>
              <Text className="paragraph-regular text-gray-500 mt-1">
                Manage your delivery locations
              </Text>
            </View>
          </View>

          <CustomButton
            title="Add New"
            onPress={openAddModal}
            style=" shrink px-4 py-2 border border-primary w-28"
            textStyle="text-sm "
          />
          {/* <Button title="Add New" onPress={openAddModal} /> */}
        </View>
      </View>

      <View className="flex-1 px-5 pt-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="paragraph-medium text-gray-500">Loading addresses...</Text>
          </View>
        ) : addresses.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8">
            <Image
              source={require('@/assets/images/empty-state.png')}
              className="w-32 h-32 mb-6"
            />
            <Text className="h3-bold text-dark-100 text-center mb-2">
              No addresses yet
            </Text>
            <Text className="paragraph-regular text-gray-500 text-center mb-6">
              Add your first delivery address to get started
            </Text>
            <CustomButton
              title="Add Address"
              onPress={openAddModal}
            />
          </View>
        ) : (
          <FlatList
            data={addresses}
            renderItem={renderAddressItem}
            keyExtractor={(item) => item.$id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      {/* Add/Edit Address Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="px-5 py-4 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="h2-bold text-dark-100">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                className="p-2"
              >
                <Text className="text-primary font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-5 pt-6">
            <View className="space-y-4">
              <CustomInput
                label="Address Title"
                value={formData.title}
                placeholder="e.g., Home, Office, etc."
                onChangeText={(value) => handleInputChange('title', value)}
              />

              <CustomInput
                label="Street Address"
                value={formData.address}
                placeholder="Enter your street address"
                onChangeText={(value) => handleInputChange('address', value)}
              />

              <CustomInput
                label="City"
                value={formData.city}
                placeholder="Enter city"
                onChangeText={(value) => handleInputChange('city', value)}
              />

              <CustomInput
                label="Country"
                value={formData.country}
                placeholder="Enter country"
                onChangeText={(value) => handleInputChange('country', value)}
              />

              <CustomInput
                label="Postal Code (Optional)"
                value={formData.postalCode}
                placeholder="Enter postal code"
                onChangeText={(value) => handleInputChange('postalCode', value)}
              />

              <TouchableOpacity
                onPress={() => handleInputChange('isDefault', !formData.isDefault)}
                className="flex-row items-center py-4"
              >
                <View className={`w-5 h-5 border-2 rounded mr-3 ${formData.isDefault ? 'bg-primary border-primary' : 'border-gray-300'
                  }`}>
                  {formData.isDefault && (
                    <Image
                      source={require('@/assets/icons/check.png')}
                      className="w-3 h-3"
                      tintColor="white"
                    />
                  )}
                </View>
                <Text className="paragraph-medium text-dark-100">
                  Set as default address
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-8 mb-6">
              <CustomButton
                title={editingAddress ? 'Update Address' : 'Add Address'}
                onPress={handleSubmit}
                isLoading={isSubmitting}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default DeliveryAddresses;
