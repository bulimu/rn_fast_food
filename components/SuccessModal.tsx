import { images } from '@/constants';
import React from 'react';
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

const SuccessModal = ({
  visible,
  onClose,
  title = "Sign Up Successful!",
  message = "Your account has been created successfully.",
  buttonText = "Go to Homepage"
}: SuccessModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-3xl p-8 items-center max-w-sm w-full">
          {/* Success Image */}
          <Image
            source={images.success}
            className="w-32 h-32 mb-6"
            resizeMode="contain"
          />

          {/* Title */}
          <Text className="text-xl font-bold text-center mb-2 text-gray-800">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-gray-600 text-center mb-8 text-base leading-6">
            {message}
          </Text>

          {/* Button */}
          <TouchableOpacity
            onPress={onClose}
            className="bg-orange-500 w-full py-4 rounded-xl"
          >
            <Text className="text-white text-center font-semibold text-lg">
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SuccessModal;