import { Fragment } from "react";
import { FlatList, Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import cn from 'clsx';
import { router } from 'expo-router';

import CartButton from '@/components/CartButton';
import { images, offers } from "@/constants";
import { useCategories } from '@/hooks/useAppwriteQueries';

export default function Index() {

  //  const { user } = useAuthStore();
  const { data: categories } = useCategories();

  const handleOfferPress = (categoryName: string) => {
    let categoryId: string | undefined = undefined;

    if (categories && categoryName) {
      const foundCategory = categories.find(c => c.name === categoryName);
      if (foundCategory) {
        categoryId = foundCategory.$id;
      }
    }
    router.push({
      pathname: '/(tabs)/search',
      params: { category: categoryId }
    });
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>

      <FlatList data={offers}
        renderItem={({ item, index }) => {
          // Render your item component here
          const isEven = index % 2 === 0;
          return (<View>
            <Pressable className={cn("offer-card", isEven ? 'flex-row-reverse' : 'flex-row')}
              style={{ backgroundColor: item.color }}
              android_ripple={{ color: "#fffff22" }}
              onPress={() => handleOfferPress(item.Category)}
            >
              {({ pressed }) => (

                <Fragment>
                  <View className={"h-full w-1/2"}>
                    <Image source={item.image} className={"size-full"} resizeMode={"contain"} />
                  </View>

                  <View className={cn("offer-card__info", isEven ? 'pl-10' : 'pr-10')}>
                    <Text className="h1-bold text-white leading-tight">
                      {item.title}
                    </Text>
                    <Image
                      source={images.arrowRight}
                      className="size-10"
                      resizeMode="contain"
                      tintColor="#ffffff"
                    />
                  </View>

                </Fragment>
              )}
            </Pressable>
          </View>);
        }}
        keyExtractor={(item, index) => index.toString()}
        contentContainerClassName="pb-28 px-5"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (

          <View className="flex-between flex-row w-full my-5">
            <View className="flex-start">
              <Text className="small-bold text-primary">DELIVER TO</Text>
              <TouchableOpacity className="flex-center flex-row gap-x-1 mt-0.5">

                <Text className="paragraph-bold text-dark-100">Croatia</Text>
                <Image source={images.arrowDown} className="size-3" resizeMode="contain" />
              </TouchableOpacity>
            </View>
            <CartButton />
          </View>

        )
        }

      />
      {/* Add your modal or other components here */}
    </SafeAreaView >
  );
}