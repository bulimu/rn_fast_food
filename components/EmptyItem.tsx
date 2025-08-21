import { View, Text, Image } from "react-native";
import React from "react";
import { images } from "@/constants";

const EmptyItem = () => {
  return (
    <View className='flex items-center justify-center gap-y-2'>
      <Image
        source={images.emptyState}
        className="  w-4/6 mb-2"
        resizeMode="contain"
        style={{ alignSelf: "center" }}
      />
      <Text className=' text-xl font-semibold '>Nothing matched your search</Text>
      <Text className=' text-lg coloer-[#666] '>Try a different search term or check for typos</Text>

    </View>
  );
};

export default EmptyItem;
