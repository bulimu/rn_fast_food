import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { createUser } from "@/lib/appwrite";
import { Link, router } from "expo-router";
import { useState } from 'react';
import { Alert, Image, Modal, Text, TouchableOpacity, View } from 'react-native';
//import SuccessModal from "@/components/SuccessModal";
import useAuthStore from "@/store/auth.store";
//import SuccessBottomSheet from "@/components/SuccessBottomSheet";
import { images } from "@/constants";

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessSheetOpen, setIsSuccessSheetOpen] = useState(false);

  const { fetchAuthenticatedUser } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSheetClose = async () => {
    setIsSuccessSheetOpen(false);
    await fetchAuthenticatedUser();
    router.replace('/');
  };

  const submit = async () => {
    const { name, email, password } = form;
    if (!name || !email || !password) {
      // Handle validation error
      return Alert.alert('Error', 'Please enter valid email address & password.');
    }
    setIsSubmitting(true);

    try {
      await createUser({ name, email, password });

      setIsSuccessSheetOpen(true);

      //Alert.alert("User created successfully");
      //setShowSuccessModal(true);
      // router.replace('/');
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

      <Modal
        visible={isSuccessSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={handleSheetClose}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={handleSheetClose}
        />
        <View style={{
          backgroundColor: 'white',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 400,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}>
        <Image
          source={images.success}
          style={{ width: 120, height: 120, marginBottom: 20 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
          Login Successful!
        </Text>
        <Text style={{ color: '#666', textAlign: 'center', marginBottom: 24 }}>
          Your account has been created and you are now logged in.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#F59E42',
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 32,
            width: '100%',
          }}
          onPress={handleSheetClose}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>
            Go to Homepage
          </Text>
        </TouchableOpacity>
        </View>
      </Modal>
      {/*   <SuccessModal
        visible={showSuccessModal}
        onClose={handleModalClose}
        title="Login Successful!"
        message="Your account has been created and you are now logged in."
        buttonText="Go to Homepage"
      /> */}
    </View>
  );
};

export default SignUp;
