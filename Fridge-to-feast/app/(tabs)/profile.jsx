import { View, Text } from 'react-native'
import React from 'react'
import Useintro from '../../components/Profile/Userintro'

export default function profile() {
  
  return (
    <View style={{
      padding: 20,
    }}>
      <Text style={{
        fontFamily: 'outfit-bold',
        fontSize: 35
      }}>profile</Text>

      {/* User Info */}
      <Useintro />

      {/* Menu List */}
    </View>
  )
}