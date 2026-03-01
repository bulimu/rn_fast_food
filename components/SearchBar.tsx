import { images } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from 'react';
import { Image, TextInput, TouchableOpacity, View } from "react-native";

const SearchBar = () => {
  /*   const { query } = useLocalSearchParams<{ query?: string }>();
    const [searchQuery, setSearchQuery] = useState(query || '');
    console.log("SearchBar query:", query); */

  const params = useLocalSearchParams<{ query: string }>();
  const [query, setQuery] = useState(params.query);

  const handleSearch = (text: string) => {
    setQuery(text);

    if (!text) router.setParams({ query: undefined });
  };

  const handleSubmit = () => {
    // guard against undefined and whitespace-only strings
    const trimmed = (query ?? '').trim();
    if (trimmed) {
      router.setParams({ query: trimmed });
    } else {
      router.setParams({ query: undefined });
    }
  }

  return (
    <View className="searchbar">

      <TextInput
        className="flex-1 p-5"
        placeholder="Search for pizzas, burgers..."
        value={query}
        onChangeText={handleSearch}
        onSubmitEditing={handleSubmit}
        placeholderTextColor="#A0A0A0"
        returnKeyType="search"
      />
      <TouchableOpacity
        className="pr-5"
        onPress={handleSubmit}
      >
        <Image
          source={images.search}
          className="size-6"
          resizeMode="contain"
          style={{ tintColor: '#5D5F6D' }}
        />
      </TouchableOpacity>
    </View>
  );
}

export default SearchBar;