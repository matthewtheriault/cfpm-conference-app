import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { HomeStack, ScheduleStack, MapStack, UpdatesStack, MoreStack } from "./TabStacks";
import { colors } from "../theme";

export type MainTabsParamList = {
  Home: undefined;
  Schedule: undefined;
  Map: undefined;
  Updates: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

const ICONS: Record<keyof MainTabsParamList, keyof typeof Ionicons.glyphMap> = {
  Home: "home",
  Schedule: "calendar",
  Map: "map",
  Updates: "megaphone",
  More: "ellipsis-horizontal-circle",
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={
              focused
                ? ICONS[route.name as keyof MainTabsParamList]
                : (`${ICONS[route.name as keyof MainTabsParamList]}-outline` as keyof typeof Ionicons.glyphMap)
            }
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: "Home" }} />
      <Tab.Screen name="Schedule" component={ScheduleStack} options={{ title: "Schedule" }} />
      <Tab.Screen name="Map" component={MapStack} options={{ title: "Map" }} />
      <Tab.Screen name="Updates" component={UpdatesStack} options={{ title: "Updates" }} />
      <Tab.Screen name="More" component={MoreStack} options={{ title: "More" }} />
    </Tab.Navigator>
  );
}
