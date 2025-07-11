import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import useAuthStore from "@/store/auth.store";
import { ProfileFieldProps } from "@/types";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
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

  // Check if user exists before using its properties
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
      // Import logoutUser function from appwrite.ts
      const { logoutUser } = await import('@/lib/appwrite');

      // Call logout function
      const { success } = await logoutUser();

      if (success) {
        // Update authentication state
        setUser(null);
        setIsAuthenticated(false);

        // Navigate to sign in
        router.replace('/sign_in');
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
          <View className="size-24 rounded-full bg-primary/10 mb-4 items-center justify-center">
            {user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="size-24 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="h1-bold text-primary">{user.name.charAt(0)}</Text>
            )}
          </View>
          <Text className="h2-bold text-dark-100">{user.name}</Text>
          <Text className="paragraph-regular text-gray-500">{user.email}</Text>
        </View>

        {/* Profile Fields */}
        <View className="bg-white rounded-lg p-5 shadow-sm shadow-black/5 mb-8">
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
        <View className="bg-white rounded-lg p-5 shadow-sm shadow-black/5 mb-8">
          <Text className="h3-bold text-dark-100 mb-4">Settings</Text>

          <TouchableOpacity className="profile-field">
            <View className="profile-field__icon">
              <Image source={images.pencil} className="size-6" resizeMode="contain" tintColor="#FE8C00" />
            </View>
            <View>
              <Text className="text-dark-100 paragraph-semibold">Edit Profile</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="profile-field">
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
    </SafeAreaView>
  );
};

export default Profile;
