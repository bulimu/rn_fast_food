import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { logoutUser } from '@/lib/appwrite';
import useAuthStore from "@/store/auth.store";
import { ProfileFieldProps } from "@/types";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileField = ({ label, value, icon }: ProfileFieldProps) => (
  <View className="profile-field">
    <View className="profile-field__icon">
      <Image source={icon} className="size-6" resizeMode="contain" tintColor="#FE8C00" />
    </View>
    <View>
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-dark-100 paragraph-semibold">{value}</Text>
    </View>
  </View>
);

const Profile = () => {
  const { user, setUser, setIsAuthenticated } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="paragraph-medium text-center">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const { success } = await logoutUser();

      if (success) {
        setUser(null);
        setIsAuthenticated(false);
        router.replace('/(auth)/sign_in');
      } else {
        Alert.alert("Error", "Failed to logout. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-5">
        {/* Profile Header */}
        <View className="items-center mb-10">
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            className="relative mb-4"
          >
            <Image
              source={user?.avatar ? { uri: user.avatar } : images.avatar}
              className="w-24 h-24 rounded-full"
              resizeMode="cover"
            />
          </TouchableOpacity>
          <Text className="h2-bold text-dark-100">{user.name}</Text>
          <Text className="paragraph-regular text-gray-500">{user.email}</Text>
        </View>

        {/* Profile Fields */}
        <View className="bg-white rounded-lg p-5 mb-8" style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', elevation: 2 }}>
          <Text className="h3-bold text-dark-100 mb-4">Account Information</Text>

          <ProfileField
            label="Full Name"
            value={user.name}
            icon={images.person}
          />

          <ProfileField
            label="Email Address"
            value={user.email}
            icon={images.envelope}
          />

          <ProfileField
            label="Account ID"
            value={user.$id || "N/A"}
            icon={images.person}
          />
        </View>

        {/* Account Actions */}
        <View className="bg-white rounded-lg p-5 mb-8" style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
          <Text className="h3-bold text-dark-100 mb-4">Settings</Text>

          <TouchableOpacity
            className="profile-field"
            onPress={() => router.push('/edit-profile')}
          >
            <View className="profile-field__icon">
              <Image source={images.pencil} className="size-6" resizeMode="contain" tintColor="#FE8C00" />
            </View>
            <View>
              <Text className="text-dark-100 paragraph-semibold">Edit Profile</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="profile-field"
            onPress={() => router.push('/delivery-addresses')}
          >
            <View className="profile-field__icon">
              <Image source={images.location} className="size-6" resizeMode="contain" tintColor="#FE8C00" />
            </View>
            <View>
              <Text className="text-dark-100 paragraph-semibold">Delivery Addresses</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="profile-field">
            <View className="profile-field__icon">
              <Image source={images.clock} className="size-6" resizeMode="contain" tintColor="#FE8C00" />
            </View>
            <View>
              <Text className="text-dark-100 paragraph-semibold">Order History</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <CustomButton
          title="Logout"
          onPress={handleLogout}
          isLoading={isLoggingOut}

          leftIcon={
            <Image
              source={images.logout}
              className="size-5 mr-2"
              resizeMode="contain"
              tintColor="#fff"
            />
          }
        />
      </ScrollView>

      {/* Avatar Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/80 justify-center items-center"
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View className="relative">
            <Image
              source={user?.avatar ? { uri: user.avatar } : images.avatar}
              className="w-80 h-80 rounded-2xl"
              resizeMode="cover"
            />
            <TouchableOpacity
              className="absolute top-4 right-4 bg-white/20 rounded-full p-2"
              onPress={() => setIsModalVisible(false)}
            >
              <Text className="text-white font-bold text-lg">×</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
