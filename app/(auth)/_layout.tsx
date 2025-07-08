import { Dimensions, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import { images } from "@/constants";
import { Redirect, Slot } from "expo-router";
import cn from "clsx";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import useAuthStore from '@/store/auth.store';


export default function Authlayout() {
  const insets = useSafeAreaInsets();

  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  return (
    <SafeAreaView edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className={cn('bg-white h-full')} keyboardShouldPersistTaps='handled' >
          <View className='w-full relative' style={{ height: (Dimensions.get('screen').height - insets.bottom) / 2.25 }}>
            <ImageBackground source={images.loginGraphic} className="size-full rounded-b-lg" resizeMode="stretch" />
            <Image source={images.logo} className="self-center size-48 absolute -bottom-16 z-10" />
          </View>
          <Slot />

        </ScrollView>
      </KeyboardAvoidingView >
    </SafeAreaView>
  );
};



