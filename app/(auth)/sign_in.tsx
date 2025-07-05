import { Text, View, Button } from "react-native";
import { router } from 'expo-router';

const SignIn = () => {
  return (
    <View>
      <Text>SignIn</Text>
      <Button title='Sign UP' onPress={() => router.push("/sign_in")} />
    </View>
  );
};

export default SignIn;
