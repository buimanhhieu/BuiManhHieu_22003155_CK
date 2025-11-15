import { Link, router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function Page() {
  return (
    <View className="flex flex-1 justify-center items-center">
      <View className="px-4">
        <Text className="text-xl mb-4 text-center">Welcome</Text>
        <Button mode="contained" onPress={() => router.navigate("(tabs)/home")}>
          Go to App
        </Button>
      </View>
    </View>
  );
}
