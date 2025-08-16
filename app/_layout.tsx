import { ActivityIndicator, View } from 'react-native';
import { useFonts } from "expo-font";
import { useFocusEffect } from '@react-navigation/native';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from "react";

import useAuthStore from "@/store/auth.store";
import './globals.css';

/* Sentry.init({
  dsn: 'https://6263ab8fcc36f3e5ae5d50f1c3007ff6@o4509626913849344.ingest.de.sentry.io/4509626952056912',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
}); */

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {


  const { isLoading, fetchAuthenticatedUser } = useAuthStore();

  const [fontsLoaded, error] = useFonts({
    "QuickSand-Bold": require('../assets/fonts/Quicksand-Bold.ttf'),
    "QuickSand-Medium": require('../assets/fonts/Quicksand-Medium.ttf'),
    "QuickSand-Regular": require('../assets/fonts/Quicksand-Regular.ttf'),
    "QuickSand-SemiBold": require('../assets/fonts/Quicksand-SemiBold.ttf'),
    "QuickSand-Light": require('../assets/fonts/Quicksand-Light.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);
  /* 
    useFocusEffect(
      useCallback(() => {
        // 每次应用获得焦点时都会检查认证状态
        fetchAuthenticatedUser();
        console.log("Fetching authenticated user...");
      }, [])
    ); */

  useEffect(() => {
    // 在组件加载时获取当前用户
    fetchAuthenticatedUser();
  }, []);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  };
  //display tabs
  return <Stack screenOptions={{ headerShown: false }} >
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
  </Stack>;
};