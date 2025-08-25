import { Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
//import seed from "@/lib/seed";
import { useLocalSearchParams } from 'expo-router';
import { FlatList } from 'react-native-gesture-handler';

import CartButton from "@/components/CartButton";
import MenuCard from "@/components/MenuCard";
import { MenuItem } from "@/types";
import cn from "clsx";

import EmptyItem from '@/components/EmptyItem';
import Filter from "@/components/Filter";
import SearchBar from "@/components/SearchBar";
import { useCategories, useMenu } from '@/hooks/useAppwriteQueries';


const Search = () => {
  const { category, query } = useLocalSearchParams<{ query: string, category: string }>();

  const { data, isLoading: loading } = useMenu(category, query, 6);
  const { data: categories } = useCategories();

  //console.log("Search data:", data);
  return (
    <SafeAreaView>

      {/* 
      <Button title='seed' onPress={() => seed().catch((error) => {
        console.error("Error seeding data:", error);
      })} /> */}
      <FlatList
        data={data}
        renderItem={({ item, index }) => {
          const isFirstRightColItem = index % 2 === 0;

          return (
            <View className={cn("flex-1 max-w-[48%]", !isFirstRightColItem ? 'mt-10' : 'mt-0')}>
              <MenuCard item={item as MenuItem} />
            </View>
          )
        }}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        columnWrapperClassName='gap-7'
        contentContainerClassName='gap-7 px-5 pb-32'
        ListHeaderComponent={() => (
          <View className="my-5 gap-5">
            <View className="flex-between flex-row w-full">
              <View className="flex-start">
                <Text className="small-bold uppercase text-primary">Search</Text>
                <View className="flex-start flex-row gap-x-1 mt-0.5">
                  <Text className="paragraph-semibold text-dark-100">Find your favorite food</Text>
                </View>
              </View>

              <CartButton />
            </View>

            <SearchBar />

            <Filter categories={categories as any} />
          </View>
        )}
        ListEmptyComponent={() => !loading && <EmptyItem />}
      />




    </SafeAreaView>
  );
};

export default Search;
