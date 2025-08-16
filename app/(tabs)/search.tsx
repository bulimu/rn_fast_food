import { getMenu } from '@/lib/appwrite';
import useAppwrite from '@/lib/useAppwrite';
import { View, Text, Button } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
//import seed from "@/lib/seed";


const Search = () => {

  const { data, refetch, loading } = useAppwrite({
    fn: getMenu,
    params: { category: '', query: '', limit: 6 },

  });

  //console.log("Search data:", data);
  return (
    <SafeAreaView>
      <Text>Search</Text>

      {/* <Button title='seed' onPress={() => seed().catch((error) => {
        console.error("Error seeding data:", error);
      })} /> */}


    </SafeAreaView>
  );
};

export default Search;
