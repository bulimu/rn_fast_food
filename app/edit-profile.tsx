import AvatarUploader from '@/components/AvatarUploader';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { updateUserProfile } from '@/lib/appwrite';
import useAuthStore from '@/store/auth.store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditProfile = () => {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateUserProfile({
        userId: user?.$id || '',
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      if (result.success) {
        // Update local user state
        setUser({
          ...user!,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        });

        Alert.alert('Success', 'Profile updated successfully!', [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="paragraph-medium text-center">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-5">
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
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
              <Text className="h2-bold text-dark-100">Edit Profile</Text>
            </View>
          </View>
          <Text className="paragraph-regular text-gray-500">
            Update your personal information
          </Text>
        </View>

        {/* Avatar Upload Section */}
        <View className="items-center mb-8">
          <AvatarUploader
            currentAvatar={user.avatar}
            userName={user.name}
          />
        </View>

        <View className="gap-y-4">
          <CustomInput
            label="Full Name"
            value={formData.name}
            placeholder="Enter your full name"
            onChangeText={(value) => handleInputChange('name', value)}
          />

          <CustomInput
            label="Email Address"
            value={formData.email}
            placeholder="Enter your email"
            keyboardType="email-address"
            onChangeText={(value) => handleInputChange('email', value)}
          />

          <CustomInput
            label="Phone Number (Optional)"
            value={formData.phone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            onChangeText={(value) => handleInputChange('phone', value)}
          />
        </View>

        <View className="mt-16 gap-y-8">
          <CustomButton
            title="Save Changes"
            onPress={handleSaveProfile}
            isLoading={isLoading}
          />

          <CustomButton
            title="Cancel"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;
