import { Link, router } from "expo-router";
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import * as Sentry from '@sentry/react-native';
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { SignInSession } from '@/lib/appwrite';


const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const submit = async () => {
    const { email, password } = form;
    if (!email || !password) {
      // Handle validation error
      return Alert.alert('Error', 'Please enter valid email address & password.');
    }
    setIsSubmitting(true);

    try {
      await SignInSession({ email, password });
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred while signing in.');
      Sentry.captureEvent(error)

    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput
        placeholder="Enter your email"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        label="Email"
        keyboardType="email-address"
      />
      <CustomInput
        placeholder="Enter your password"
        value={form.password}
        onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
        label="Password"
        secureTextEntry={true}
      />

      <CustomButton
        title="Sign In"
        onPress={submit}
        isLoading={isSubmitting}
      />
      <View className='flex justify-center mt-5 flex-row gap-x-2'>
        <Text className="base-regular text-gray-100">
          Don&apos;t have an account?
        </Text>
        <Link href="/(auth)/sign_up" className='text-primary'>
          Sign Up
        </Link>
      </View>
    </View >
  );
};

export default SignIn;
