import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="jelajah"
        options={{
          title: 'Jelajah',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="mappin.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mapwebview"
        options={{
          title: 'Peta',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="gmap"
        options={{
          title: 'G-Map',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="pin.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
