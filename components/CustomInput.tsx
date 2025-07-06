import { CustomInputProps } from "@/types";
import cn from "clsx";
import { useState } from "react";
import { Text, TextInput, View } from 'react-native';

const CustomInput = ({ placeholder = "Enter text",
  value,
  onChangeText,
  secureTextEntry = false,
  label,
  keyboardType = "default",
}: CustomInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className='w-full'>
      <Text className='label'>{label}</Text>

      <TextInput
        autoCapitalize='none'
        autoCorrect={false}
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        className={cn('input', isFocused ? 'border-primary' : 'border-gray-300')}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

export default CustomInput;
