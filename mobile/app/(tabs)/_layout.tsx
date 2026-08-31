import { Tabs } from "expo-router";
import { View } from "react-native";
import { Colors } from "../../constants/theme";

function TabIcon({ color }: { color: string }) {
  return (
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 6,
        backgroundColor: color,
      }}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.coral,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          height: 62,
          borderTopColor: Colors.border,
          backgroundColor: Colors.card,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "خانه",
          tabBarIcon: ({ color }) => <TabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "اهداف",
          tabBarIcon: ({ color }) => <TabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: "سلامت",
          tabBarIcon: ({ color }) => <TabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: "مالی",
          tabBarIcon: ({ color }) => <TabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "تحلیل",
          tabBarIcon: ({ color }) => <TabIcon color={color} />,
        }}
      />
    </Tabs>
  );
}