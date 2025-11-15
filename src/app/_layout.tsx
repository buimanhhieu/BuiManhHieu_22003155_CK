import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import { Stack } from "expo-router";
import { Text } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import { initDatabase } from "@/db";

export default function Layout() {
  return (
    <SQLiteProvider 
      databaseName="app.db" 
      onInit={initDatabase}
    >
      <SafeAreaProvider>
        <SafeAreaView className="flex-1">
          <Text className="text-3xl font-bold text-center py-2">
            BuiManhHieu_22003155_CK1
          </Text>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index"></Stack.Screen>
            <Stack.Screen name="(tabs)"></Stack.Screen>
          </Stack>
        </SafeAreaView>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}
