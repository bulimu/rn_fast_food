import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { Link, router } from "expo-router";
import { useState } from 'react';
import { Text, View, Alert } from 'react-native';
import { createUser } from "@/lib/appwrite";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const submit = async () => {
    const { name, email, password } = form;
    if (!name || !email || !password) {
      // Handle validation error
      return Alert.alert('Error', 'Please enter valid email address & password.');
    }
    setIsSubmitting(true);

    try {
      await createUser({ name, email, password });
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred while signing in.');

    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput
        placeholder="Enter your name"
        value={form.name}
        onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
        label="Name"
      />
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
        title="Sign Up"
        onPress={submit}
        isLoading={isSubmitting}
      />
      <View className='flex justify-center mt-5 flex-row gap-x-2'>
        <Text className="base-regular text-gray-100">
          Already have an account?
        </Text>
        <Link href="/(auth)/sign_in" className='text-primary'>
          Sign In
        </Link>
      </View>
    </View >
  );
};

export default SignIn;
