import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { CustomHeaderProps } from "@/types";
import { images } from "@/constants";
import { useNavigation } from '@react-navigation/native';

const CustomHeader = ({ title, rightComponent }: CustomHeaderProps) => {
  //const router = useRouter();
  const navigation = useNavigation();

  return (
    <View className="custom-header">
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image
          source={images.arrowBack}
          className="size-5"
          resizeMode="contain"
        />
      </TouchableOpacity>

      {title && <Text className="base-semibold text-dark-100">{title}</Text>}
      
      {rightComponent ? rightComponent : <View className="size-5" />}
    </View>
  );
};

export default CustomHeader;