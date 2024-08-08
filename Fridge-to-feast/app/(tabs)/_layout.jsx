import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors } from './../../constants/Colors';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
        headerShown:false,
        tabBarActiveTintColor:Colors.PRIMARY
        }}>
        <Tabs.Screen name='ingredients'
        options={{
            tabBarLabel:'Ingredients',
            tabBarIcon:({color})=><MaterialCommunityIcons
            name="fridge" size={24} color={color} />
        }}
        />
        <Tabs.Screen name='home'
        options={{
            tabBarLabel:'Menu',
            tabBarIcon:({color})=><FontAwesome6 name="bowl-food"
            size={24} color={color} />
        }}
        />
        <Tabs.Screen name='profile'
        options={{
            tabBarLabel:'Profile',
            tabBarIcon:({color})=><MaterialCommunityIcons name="account-circle"
            size={24} color={color} />
        }}
        />
    </Tabs>
  )
}