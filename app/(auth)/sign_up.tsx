import { View, Text, Button } from "react-native";
import { router } from 'expo-router';

const SignUp = () => {
  return (
    <View>
      <Text>SignUp</Text>
      <Button title='Sign In' onPress={() => router.push("/(auth)/sign_up")} />
    </View>
  );
};

export default SignUp;
