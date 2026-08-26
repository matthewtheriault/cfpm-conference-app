import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import ConferenceCodeScreen from "../screens/ConferenceCodeScreen";
import NameEntryScreen from "../screens/NameEntryScreen";
import AdminLoginScreen from "../screens/AdminLoginScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import AdminScheduleScreen from "../admin/screens/AdminScheduleScreen";
import AdminSpeakersScreen from "../admin/screens/AdminSpeakersScreen";
import AdminExhibitorsScreen from "../admin/screens/AdminExhibitorsScreen";
import AdminSponsorsScreen from "../admin/screens/AdminSponsorsScreen";
import AdminEventsScreen from "../admin/screens/AdminEventsScreen";
import AdminMapScreen from "../admin/screens/AdminMapScreen";
import AdminBoardScreen from "../admin/screens/AdminBoardScreen";
import AdminPollsScreen from "../admin/screens/AdminPollsScreen";
import AdminPollEditScreen from "../admin/screens/AdminPollEditScreen";
import AdminPollResponsesScreen from "../admin/screens/AdminPollResponsesScreen";
import MainTabs from "./MainTabs";
import { useAccess } from "../context/AccessContext";
import { useUserProfile } from "../context/UserProfileContext";
import { colors } from "../theme";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isUnlocked, isLoading: accessLoading } = useAccess();
  const { isProfileComplete, isLoading: profileLoading } = useUserProfile();

  if (accessLoading || profileLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isUnlocked ? (
        <Stack.Screen name="Gate" component={ConferenceCodeScreen} />
      ) : !isProfileComplete ? (
        <Stack.Screen name="NameEntry" component={NameEntryScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
      <Stack.Screen
        name="AdminLogin"
        component={AdminLoginScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ presentation: "modal", headerShown: true, title: "Admin" }}
      />
      <Stack.Screen
        name="AdminSchedule"
        component={AdminScheduleScreen}
        options={{ headerShown: true, title: "Manage Schedule" }}
      />
      <Stack.Screen
        name="AdminSpeakers"
        component={AdminSpeakersScreen}
        options={{ headerShown: true, title: "Manage Speakers" }}
      />
      <Stack.Screen
        name="AdminExhibitors"
        component={AdminExhibitorsScreen}
        options={{ headerShown: true, title: "Manage Exhibitors" }}
      />
      <Stack.Screen
        name="AdminSponsors"
        component={AdminSponsorsScreen}
        options={{ headerShown: true, title: "Manage Sponsors" }}
      />
      <Stack.Screen
        name="AdminEvents"
        component={AdminEventsScreen}
        options={{ headerShown: true, title: "Manage Events" }}
      />
      <Stack.Screen
        name="AdminMap"
        component={AdminMapScreen}
        options={{ headerShown: true, title: "Manage Maps" }}
      />
      <Stack.Screen
        name="AdminBoard"
        component={AdminBoardScreen}
        options={{ headerShown: true, title: "Manage Board & Staff" }}
      />
      <Stack.Screen
        name="AdminPolls"
        component={AdminPollsScreen}
        options={{ headerShown: true, title: "Manage Polls & Surveys" }}
      />
      <Stack.Screen
        name="AdminPollEdit"
        component={AdminPollEditScreen}
        options={{ headerShown: true, title: "Edit Poll" }}
      />
      <Stack.Screen
        name="AdminPollResponses"
        component={AdminPollResponsesScreen}
        options={{ headerShown: true, title: "Responses" }}
      />
    </Stack.Navigator>
  );
}
