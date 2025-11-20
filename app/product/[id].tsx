import CartButton from '@/components/CartButton';
import CustomButton from '@/components/CustomButton';
import CustomHeader from '@/components/CustomHeader';
import CustomizationOption from '@/components/CustomizationOption';
import QuantitySelector from '@/components/QuantitySelector';
import { images } from '@/constants';
import { useProduct } from '@/hooks/useAppwriteQueries';
import { appwriteConfig } from '@/lib/appwrite';
import { useCartStore } from '@/store/cart.store';
import { CartCustomization } from '@/types';
import { PriceCalculator } from '@/utils/PriceCalculator';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCartStore();
  const navigation = useNavigation();

  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<CartCustomization[]>([]);

  const { data: product, isLoading: loading, error } = useProduct(id!);



  const productData = product as any;

  useEffect(() => {
    if (error) {
      Alert.alert('Error', 'Failed to load product details');
      navigation.goBack();
    }
  }, [error, navigation]);

  const handleCustomizationToggle = (customization: any) => {
    setSelectedCustomizations(prev => {
      const existing = prev.find(c => c.id === customization.$id);

      if (existing) {
        return prev.filter(c => c.id !== customization.$id);
      } else {
        return [...prev, {
          id: customization.$id,
          name: customization.name,
          price: customization.price,
          type: customization.type,
          quantity: 1
        }];
      }
    });
  };

  const handleCustomizationQuantityChange = (customizationId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setSelectedCustomizations(prev =>
        prev.filter(c => c.id !== customizationId)
      );
      return;
    }

    setSelectedCustomizations(prev =>
      prev.map(c =>
        c.id === customizationId ? { ...c, quantity: newQuantity } : c
      )
    );
  };

  const handleAddToCart = () => {
    if (!productData) return;

    const cartCustomizations = selectedCustomizations.map(c => ({
      id: c.id,
      name: c.name,
      price: c.price,
      type: c.type,
      quantity: c.quantity || 1
    }));

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: productData.$id,
        name: productData.name,
        price: productData.price,
        image_url: `${productData.image_url}?project=${appwriteConfig.projectId}`,
        customizations: cartCustomizations
      });
    }

    Alert.alert('Success', 'Item added to cart!');
  };

  const totalPrice = productData
    ? PriceCalculator.calculateTotalPrice(productData.price, quantity, selectedCustomizations)
    : 0;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white flex-center">
        <ActivityIndicator size="large" color="#FF9C01" />
      </SafeAreaView>
    );
  }

  if (!productData) {
    return (
      <SafeAreaView className="flex-1 bg-white flex-center">
        <Text className="text-lg text-gray-500">Product not found</Text>
      </SafeAreaView>
    );
  }

  const toppings = productData.customizations?.filter((c: any) => c.type === 'topping') || [];
  const sides = productData.customizations?.filter((c: any) => c.type === 'side') || [];


  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-5 pt-5">
      {/* top navigation */}
      <CustomHeader rightComponent={<CartButton />} />

      <ScrollView className="flex-1 px-1" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold text-dark-100 mt-2 mb-4">
          {productData.name}
        </Text>
        <View className="flex-row items-center justify-between">
          <View>

            <Text className="text-gray-500 mb-3">{productData.categories}</Text>
            {/* Rating */}
            <View className="flex-row items-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Image
                  key={star}
                  source={images.star}
                  className="w-4 h-4 mr-1"
                  resizeMode="contain"
                  tintColor={star <= Math.round(productData.rating) ? "text-primary" : '#E5E5E5'}
                />
              ))}
              <Text className="ml-2 text-gray-600">
                {productData.rating}/5
              </Text>
            </View>

            <Text className="h3-bold mb-4">
              {PriceCalculator.formatPrice(productData.price)}
            </Text>

            {/*  nutrition Info */}
            <View className="flex-row mb-4">
              <View className="mr-6">
                <Text className="paragraph-medium text-gray-500">Calories</Text>
                <Text className="base-semibold font-semibold text-dark-100">
                  {productData.nutritionInfo?.calories || productData.calories} Cal
                </Text>
              </View>
              <View>
                <Text className="paragraph-medium text-gray-500">Protein</Text>
                <Text className="base-bold font-semibold text-dark-100">
                  {productData.nutritionInfo?.protein || productData.protein}g
                </Text>
              </View>
            </View>

            {/* */}
            {/* <View className="mb-4">
              <Text className="body-medium text-gray-500 mr-2">Bun Tag:</Text>
              <Text className="base-semibold text-dark-100">Whole Wheat</Text>
            </View> */}
          </View>
          {/* product image */}
          <View className="ml-[-18px] mt-8">
            <Image
              source={{ uri: `${productData.image_url}?project=${appwriteConfig.projectId}` }}
              className="w-64 h-64"
              resizeMode="contain"
            />
          </View>
        </View>

        {/*  product info */}
        <View className="my-3 flex-row items-center justify-between bg-orange-100 p-4 rounded-xl">
          <Text className="text-primary font-semibold mr-4">📦 Free Delivery</Text>
          <Text className="text-gray-600">⏱️ 20-30 mins</Text>
          <Text className="text-gray-600">⭐ 4.5</Text>
        </View>

        {/* description */}
        <View className=" py-6 mt-2">
          <Text className="text-gray-600 leading-6">
            {productData.description}
          </Text>
        </View>

        {/* Toppings */}
        {toppings.length > 0 && (
          <TouchableOpacity className="py-6 mt-2">
            <Text className="h3-bold mb-4">Toppings</Text>
            {toppings.map((topping: any) => {
              const selected = selectedCustomizations.find(c => c.id === topping.$id);
              return (
                <CustomizationOption
                  key={topping.$id}
                  item={topping as any}
                  isSelected={!!selected}
                  quantity={selected?.quantity || 0}
                  onToggle={() => handleCustomizationToggle(topping)}
                  onQuantityChange={(qty) => handleCustomizationQuantityChange(topping.$id, qty)}
                />
              );
            })}
          </TouchableOpacity>
        )}

        {/* Side Options*/}
        {sides.length > 0 && (
          <View className="py-6 mt-2">
            <Text className="h3-bold mb-4">Side options</Text>
            {sides.map((side: any) => {
              const selected = selectedCustomizations.find(c => c.id === side.$id);
              return (
                <CustomizationOption
                  key={side.$id}
                  item={side as any}
                  isSelected={!!selected}
                  quantity={selected?.quantity || 0}
                  onToggle={() => handleCustomizationToggle(side)}
                  onQuantityChange={(qty) => handleCustomizationQuantityChange(side.$id, qty)}
                />
              );
            })}
          </View>
        )}


        <View className="pb-32" />
      </ScrollView>

      {/* foot */}
      <View
        className=" px-2 py-6 rounded-full mb-6 flex-row items-center justify-between gap-x-4"
        style={{
          backgroundColor: 'white',
          shadowColor: '#1a1a1a',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5
        }}>

        <QuantitySelector
          quantity={quantity}
          onIncrease={() => setQuantity(q => q + 1)}
          onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
        />
        <CustomButton
          title={`Add to cart - ${PriceCalculator.formatPrice(totalPrice)}`}
          style='shrink'
          leftIcon={
            <Image
              source={images.bag}
              className="size-5 mr-2"
              resizeMode="contain"
              tintColor="#fff"
            />}
          onPress={handleAddToCart}
        />
      </View>
    </SafeAreaView >
  );
};

export default ProductDetailScreen;
