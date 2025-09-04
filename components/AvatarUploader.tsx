import { uploadAvatar } from '@/lib/appwrite';
import useAuthStore from '@/store/auth.store';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';


interface AvatarUploaderProps {
  currentAvatar?: string;
  userName: string;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

const AvatarUploader = ({
  currentAvatar,
  userName,
  onAvatarUpdate
}: AvatarUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { user, setUser } = useAuthStore();

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and photo library permissions to upload avatar.'
      );
      return false;
    }
    return true;
  };

  const showImagePicker = () => {
    Alert.alert(
      'Update Avatar',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Photo Library', onPress: () => openImageLibrary() },
      ]
    );
  };

  const openCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8, // Higher quality since we'll compress later
        allowsMultipleSelection: false,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openImageLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8, // Higher quality since we'll compress later
        allowsMultipleSelection: false,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening image library:', error);
      Alert.alert('Error', 'Failed to open image library');
    }
  };

  const handleImageUpload = async (imageUri: string) => {
    // Try different possible user ID fields
    const userId = user?.$id || user?.id || user?.accountId;

    if (!userId) {
      console.error('User ID not found. User object:', user);
      Alert.alert('Error', 'User ID not found. Please try logging in again.');
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadAvatar(imageUri, userId);

      if (result.success && result.avatarUrl) {
        console.log('Upload successful! New avatar URL:', result.avatarUrl);

        // Update local user state
        const updatedUser = { ...user, avatar: result.avatarUrl };
        setUser(updatedUser);

        // Call callback if provided
        if (onAvatarUpdate) {
          onAvatarUpdate(result.avatarUrl);
        }

        Alert.alert('Success', 'Avatar updated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Error', 'Failed to update avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={showImagePicker}
      disabled={isUploading}
      className="items-center mb-4"
    >
      <View className="size-24 rounded-full bg-primary/10 items-center justify-center relative">
        {currentAvatar?.trim() ? (
          <Image
            source={{ uri: currentAvatar }}
            style={{ width: 96, height: 96, borderRadius: 48 }}
            resizeMode="cover"
          />
        ) : (
          <Text className="h1-bold text-primary">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        )}

        {/* Upload overlay */}
        {isUploading && (
          <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
            <ActivityIndicator size="small" color="#FE8C00" />
          </View>
        )}

        {/* Edit indicator */}
        <View className="absolute -bottom-1 -right-1 bg-primary size-8 rounded-full items-center justify-center">
          <Text className="text-white text-xs font-bold">
            {isUploading ? '...' : '+'}
          </Text>
        </View>
      </View>

      <Text className="text-gray-500 text-sm mt-2">
        {isUploading ? 'Uploading...' : 'Tap to change avatar'}
      </Text>
    </TouchableOpacity>
  );
};

export default AvatarUploader;
