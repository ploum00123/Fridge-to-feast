import { View, Text, Image } from 'react-native'
import React from 'react'
import Userintro from '../../components/Profile/Userintro'

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
      <Userintro />

      {/* Menu List */}
    </View>
  )
}