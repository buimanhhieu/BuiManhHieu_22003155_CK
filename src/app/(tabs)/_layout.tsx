import { Tabs } from "expo-router";
import React from "react";
import { Icon } from "react-native-paper";

const Tabslayout = () => {
  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarActiveTintColor: "purple" }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Movies",
          tabBarIcon: ({ focused, color }) => (
            <Icon
              source={focused ? "movie" : "movie-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default Tabslayout;
