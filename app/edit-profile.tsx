import AvatarUploader from '@/components/AvatarUploader';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { images } from '@/constants';
import { updateUserProfile } from '@/lib/appwrite';
import useAuthStore from '@/store/auth.store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
    setFormData(prev => ({ ...prev, [field]: value }));
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
        setUser({
          ...user!,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        });
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.back() },
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FE8C00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        }}
      >
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
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#1a1a1a' }}>Edit Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <View
          style={{
            backgroundColor: '#fff',
            marginHorizontal: 20,
            marginTop: 20,
            borderRadius: 20,
            padding: 24,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <AvatarUploader currentAvatar={user.avatar} userName={user.name} />
        </View>

        {/* Form Card */}
        <View
          style={{
            backgroundColor: '#fff',
            marginHorizontal: 20,
            marginTop: 16,
            borderRadius: 20,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#bbb', letterSpacing: 1, marginBottom: 16 }}>
            PERSONAL INFO
          </Text>

          <CustomInput
            label="Full Name"
            value={formData.name}
            placeholder="Enter your full name"
            onChangeText={(v) => handleInputChange('name', v)}
          />

          <View style={{ height: 14 }} />
          <CustomInput
            label="Email Address"
            value={formData.email}
            placeholder="Enter your email"
            keyboardType="email-address"
            onChangeText={(v) => handleInputChange('email', v)}
          />

          <View style={{ height: 14 }} />
          <CustomInput
            label="Phone Number"
            value={formData.phone}
            placeholder="Optional"
            keyboardType="phone-pad"
            onChangeText={(v) => handleInputChange('phone', v)}
          />
        </View>

        {/* Buttons */}
        <View style={{ marginHorizontal: 20, marginTop: 24, gap: 12 }}>
          <CustomButton
            title="Save Changes"
            onPress={handleSaveProfile}
            isLoading={isLoading}
          />
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              paddingVertical: 14,
              borderRadius: 50,
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#999' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;
