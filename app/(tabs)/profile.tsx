import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { logoutUser } from '@/lib/appwrite';
import useAuthStore from "@/store/auth.store";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Menu Row ────────────────────────────────────────────────
interface MenuRowProps {
  icon: any;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}

const MenuRow = ({ icon, label, subtitle, onPress, danger }: MenuRowProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.6}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: '#fff',
      borderRadius: 14,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }}
  >
    <View
      style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: danger ? '#fef2f2' : '#FFF5EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}
    >
      <Image
        source={icon}
        style={{ width: 20, height: 20, tintColor: danger ? '#ef4444' : '#FE8C00' }}
      />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color: danger ? '#ef4444' : '#1a1a1a' }}>
        {label}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: 12, color: '#999', marginTop: 1 }}>{subtitle}</Text>
      )}
    </View>
    <Image
      source={images.arrowRight}
      style={{ width: 16, height: 16, tintColor: '#ccc' }}
    />
  </TouchableOpacity>
);

const Profile = () => {
  const { user, setUser, setIsAuthenticated } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FE8C00" />
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Profile Card ──────────────────────────────────── */}
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
          <TouchableOpacity onPress={() => setIsModalVisible(true)} activeOpacity={0.8}>
            <View style={{ position: 'relative' }}>
              <Image
                source={user?.avatar ? { uri: user.avatar } : images.avatar}
                style={{ width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#FFF5EB' }}
                resizeMode="cover"
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: -2,
                  backgroundColor: '#FE8C00',
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#fff',
                }}
              >
                <Image source={images.pencil} style={{ width: 13, height: 13, tintColor: '#fff' }} />
              </View>
            </View>
          </TouchableOpacity>

          <Text style={{ fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginTop: 14 }}>
            {user.name}
          </Text>
          <Text style={{ fontSize: 14, color: '#999', marginTop: 4 }}>{user.email}</Text>
        </View>

        {/* ─── Account Info ──────────────────────────────────── */}
        <View style={{ marginHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#bbb', letterSpacing: 1, marginBottom: 10, marginLeft: 4 }}>
            ACCOUNT
          </Text>
          <MenuRow
            icon={images.person}
            label="Edit Profile"
            subtitle="Name, email, phone"
            onPress={() => router.push('/edit-profile')}
          />
          <MenuRow
            icon={images.location}
            label="Delivery Addresses"
            subtitle="Manage saved locations"
            onPress={() => router.push('/delivery-addresses')}
          />
        </View>

        {/* ─── Orders ────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 20, marginTop: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#bbb', letterSpacing: 1, marginBottom: 10, marginLeft: 4 }}>
            ORDERS
          </Text>
          <MenuRow
            icon={images.clock}
            label="Order History"
            subtitle="View past orders"
            onPress={() => router.push('/order-history')}
          />
        </View>

        {/* ─── Logout ────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 20, marginTop: 20 }}>
          <CustomButton
            title="Log Out"
            onPress={handleLogout}
            isLoading={isLoggingOut}
            style="bg-white border border-red-200"
            textStyle="text-red-500"
            leftIcon={
              <Image source={images.logout} style={{ width: 18, height: 18, tintColor: '#ef4444', marginRight: 8 }} />
            }
          />
        </View>
      </ScrollView>

      {/* ─── Avatar Full-screen Modal ────────────────────────── */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }}
        >
          <Image
            source={user?.avatar ? { uri: user.avatar } : images.avatar}
            style={{ width: 300, height: 300, borderRadius: 20 }}
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => setIsModalVisible(false)}
            style={{
              position: 'absolute',
              top: 60,
              right: 24,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
