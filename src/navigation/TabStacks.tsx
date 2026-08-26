import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AdminHeaderButton } from "../components/AdminHeaderButton";
import { colors } from "../theme";

import HomeScreen from "../screens/HomeScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import LectureDetailScreen from "../screens/LectureDetailScreen";
import ScheduleImageScreen from "../screens/ScheduleImageScreen";
import MapScreen from "../screens/MapScreen";
import UpdatesScreen from "../screens/UpdatesScreen";
import MoreScreen from "../screens/MoreScreen";
import EventsScreen from "../screens/EventsScreen";
import SpeakersScreen from "../screens/SpeakersScreen";
import SpeakerDetailScreen from "../screens/SpeakerDetailScreen";
import ExhibitorsScreen from "../screens/ExhibitorsScreen";
import ExhibitorDetailScreen from "../screens/ExhibitorDetailScreen";
import SponsorsScreen from "../screens/SponsorsScreen";
import PollsScreen from "../screens/PollsScreen";
import PollDetailScreen from "../screens/PollDetailScreen";
import BoardScreen from "../screens/BoardScreen";

const rootScreenOptions = {
  headerShown: true,
  headerRight: () => <AdminHeaderButton />,
  headerTitleStyle: { fontWeight: "800" as const },
  headerTintColor: colors.ink,
};

const detailScreenOptions = {
  headerRight: undefined,
};

const HomeStackNav = createNativeStackNavigator();
export function HomeStack() {
  return (
    <HomeStackNav.Navigator>
      <HomeStackNav.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ ...rootScreenOptions, title: "CFPM Conference" }}
      />
    </HomeStackNav.Navigator>
  );
}

const ScheduleStackNav = createNativeStackNavigator();
export function ScheduleStack() {
  return (
    <ScheduleStackNav.Navigator>
      <ScheduleStackNav.Screen
        name="ScheduleMain"
        component={ScheduleScreen}
        options={{ ...rootScreenOptions, title: "Schedule" }}
      />
      <ScheduleStackNav.Screen
        name="LectureDetail"
        component={LectureDetailScreen}
        options={{ ...rootScreenOptions, ...detailScreenOptions, title: "Session" }}
      />
      <ScheduleStackNav.Screen
        name="ScheduleImage"
        component={ScheduleImageScreen}
        options={{ ...rootScreenOptions, ...detailScreenOptions, title: "Full Schedule" }}
      />
    </ScheduleStackNav.Navigator>
  );
}

const MapStackNav = createNativeStackNavigator();
export function MapStack() {
  return (
    <MapStackNav.Navigator>
      <MapStackNav.Screen
        name="MapMain"
        component={MapScreen}
        options={{ ...rootScreenOptions, title: "Map" }}
      />
    </MapStackNav.Navigator>
  );
}

const UpdatesStackNav = createNativeStackNavigator();
export function UpdatesStack() {
  return (
    <UpdatesStackNav.Navigator>
      <UpdatesStackNav.Screen
        name="UpdatesMain"
        component={UpdatesScreen}
        options={{ ...rootScreenOptions, title: "Updates" }}
      />
    </UpdatesStackNav.Navigator>
  );
}

const MoreStackNav = createNativeStackNavigator();
export function MoreStack() {
  return (
    <MoreStackNav.Navigator>
      <MoreStackNav.Screen
        name="MoreMain"
        component={MoreScreen}
        options={{ ...rootScreenOptions, title: "More" }}
      />
      <MoreStackNav.Screen
        name="Events"
        component={EventsScreen}
        options={{ ...rootScreenOptions, ...detailScreenOptions, title: "Events" }}
      />
      <MoreStackNav.Screen
        name="Speakers"
        component={SpeakersScreen}
        options={{ ...rootScreenOptions, ...detailScreenOptions, title: "Speakers" }}
      />
      <MoreStackNav.Screen
        name="SpeakerDetail"
        component={SpeakerDetailScreen}
        options={{ ...rootScreenOptions, ...detailScreenOptions, title: "Speaker" }}
      />
      <MoreStackNav.Screen
        name="Exhibitors"
        component={ExhibitorsScreen}
        options={{ ...rootScreenOptions, ...detailScreenOptions, title: "Exhibitors" }}
      />
      <MoreStackNav.Screen
        name="ExhibitorDetail"
        component={ExhibitorDetailScreen}
        options={{ ...rootScreenOptions, ...detailScreenOptions, title: "Exhibitor" }}
      />
      <MoreStackNav.Screen
        name="Sponsors"
        component={SponsorsScreen}
        options={{ ...rootScreenOptions, ...detailScreenOptions, title: "Sponsors" }}
      />
      <MoreStackNav.Screen
        name="Board"
        component={BoardScreen}
        options={{ ...rootScreenOptions, ...detailScreenOptions, title: "Board & Staff" }}
      />
      <MoreStackNav.Screen
        name="Polls"
        component={PollsScreen}
        options={{ ...rootScreenOptions, ...detailScreenOptions, title: "Polls & Surveys" }}
      />
      <MoreStackNav.Screen
        name="PollDetail"
        component={PollDetailScreen}
        options={{ ...rootScreenOptions, ...detailScreenOptions, title: "Poll" }}
      />
    </MoreStackNav.Navigator>
  );
}
