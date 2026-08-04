import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Image } from "expo-image";
import { useApp } from '@/context/AppContext'
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function TabLayout() {
  const { auth } = useApp();
  const user = auth.user;
  const {colors} = useTheme()
  
  const insets = useSafeAreaInsets();


  const displayAvatar =  user?.avatar;


  return (
    <Tabs screenOptions={{
      headerShown:false ,
      tabBarActiveTintColor : colors.primary ,
      tabBarInactiveTintColor: colors.onSurfaceVariant ,
      
      tabBarStyle : {
        backgroundColor: colors.surfaceLowest,
        borderTopColor: colors.surfaceHigh ,
        borderTopWidth : 1 ,
        height:  80 + insets.bottom ,
        paddingBottom:  insets.bottom + 12 ,
        paddingTop: 8
      } ,
      tabBarLabelStyle : {
        fontSize: 14,
        fontWeight: "600"
      }
    }}>
      <Tabs.Screen name='map' options={{
        title: "Map" ,
        tabBarIcon: ({color , focused}) => (
          <Ionicons name={focused ? "map" : "map-outline"} size={22} color={color}/>
        )
      }}/>
      <Tabs.Screen name='index' options={{
        title: "Messages" ,
        tabBarIcon: ({color , focused}) => (
          <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={22} color={color}/>
        )
      }}/>
      <Tabs.Screen name='search' options={{
        title: "Search" ,
        tabBarIcon: ({color , focused}) => (
          <Ionicons name={focused ? "search" : "search-outline"} size={22} color={color}/>
        )
      }}/>
      {/* <Tabs.Screen name='profile' options={{
        title: "Profile" ,
        tabBarIcon: ({color , focused}) => (
          <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color}/>
        )
      }}/> */}
      <Tabs.Screen
  name="profile"
  options={{
    title: "Profile",
    tabBarIcon: ({ focused }) => (
      displayAvatar ? (
        <View
          style={{
            padding: 1,
            borderRadius: 18,
            borderWidth: focused ? 2 : 0,
            borderColor: colors.primary,
          }}
        >
          <Image
            source={displayAvatar}
            cachePolicy="memory-disk"
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
            }}
          />
        </View>
      ) : (
        <Ionicons
          name={focused ? "person" : "person-outline"}
          size={22}
          color={focused ? colors.primary : colors.onSurfaceVariant}
        />
      )
    ),
  }}
/>
    </Tabs>
  )
}