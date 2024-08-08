import { View, Text } from 'react-native'
import React from 'react'
import { useUser } from '@clerk/clerk-expo'

export default function Userintro() {
    const {user}=useUser();
  return (
    <View>
      <Image source={{uri:user?.imageUrl}}
        style={{
          width: 50,
          
        }}
      />
    </View>
  )
}