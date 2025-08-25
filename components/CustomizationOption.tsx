import { ProductCustomization } from '@/types';
import { PriceCalculator } from '@/utils/PriceCalculator';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface CustomizationOptionProps {
  item: ProductCustomization;
  isSelected: boolean;
  quantity: number;
  onToggle: () => void;
  onQuantityChange: (quantity: number) => void;
}

const CustomizationOption: React.FC<CustomizationOptionProps> = ({
  item,
  isSelected,
  quantity,
  onToggle,
  onQuantityChange
}) => {
  const handleIncrease = () => {
    if (isSelected) {
      onQuantityChange(quantity + 1);
    } else {
      onToggle();
      onQuantityChange(1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    } else {
      onToggle();
      onQuantityChange(0);
    }
  };

  return (
    <View className="bg-white p-4  shadow-lg shadow-black/30  mb-3">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center flex-1">
          {item.image_url && (
            <View className="w-16 h-16 bg-primary/10 rounded-lg mr-3 flex-center">
              <Image
                source={{ uri: item.image_url }}
                className="w-12 h-12"
                resizeMode="contain"
              />
            </View>
          )}
          <View className="flex-1">
            <Text className="paragraph-semibold text-dark-100">
              {item.name}
            </Text>
            <Text className="body-regular text-primary font-medium">
              {PriceCalculator.formatPrice(item.price)}
            </Text>
          </View>
        </View>


        {/*  Quantity Control */}
        <View className="flex-row items-center gap-3">
          {isSelected && (
            <>
              <TouchableOpacity
                onPress={handleDecrease}
                className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex-center"
              >
                <Text className="text-red-600 font-bold text-lg">-</Text>
              </TouchableOpacity>

              <Text className="text-base font-bold text-dark-100 min-w-6 text-center">
                {quantity}
              </Text>
            </>
          )}

          <TouchableOpacity
            onPress={handleIncrease}
            className={`w-8 h-8 rounded-full flex-center ${isSelected
              ? 'bg-primary border border-primary'
              : ' bg-primary/70 border border-primary/70'
              }`}
          >
            <Text className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-white-100'
              }`}>
              +
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CustomizationOption;
