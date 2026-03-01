import { images } from '@/constants';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  minQuantity?: number;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  minQuantity = 1
}) => {
  return (
    <View className="flex-row items-center justify-center gap-2">
      <TouchableOpacity
        onPress={onDecrease}
        disabled={quantity <= minQuantity}
        className={`w-10 h-10 rounded-full border-2 flex-center ${quantity <= minQuantity
          ? 'border-gray-300 bg-gray-100'
          : 'border-primary bg-white'
          }`}
      >
        <Image
          source={images.minus}
          className="w-4 h-4"
          resizeMode="contain"
          style={{ tintColor: quantity <= minQuantity ? '#ccc' : '#FF9C01' }}
        />
      </TouchableOpacity>

      <Text className="text-xl font-bold text-dark-100 min-w-8 text-center">
        {quantity}
      </Text>

      <TouchableOpacity
        onPress={onIncrease}
        className="w-10 h-10 rounded-full border-2 border-primary bg-white flex-center"
      >
        <Image
          source={images.plus}
          className="w-4 h-4"
          resizeMode="contain"
          style={{ tintColor: '#FF9C01' }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default QuantitySelector;
