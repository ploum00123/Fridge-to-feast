import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/Colors'

export default function CategoryItem({ category, onCategoryPress }) {
  return (
    <TouchableOpacity onPress={()=>onCategoryPress(category)} style={{ alignItems: 'center', marginBottom: 20 }}>
      <View style={{
        padding: 10,
        backgroundColor: Colors.ICON_BG,
        borderRadius: 99,
        marginRight: 15,
      }}>
        <Image 
          source={{ uri: category.category_image }} 
          style={{
            width: 40,
            height: 40,
          }}
        />
      </View>
      <Text style={{
        fontSize: 12,
        fontFamily: 'outfit-medium',
        textAlign: 'center',
        marginTop: 5,
      }}>{category.category_name}</Text>
    </TouchableOpacity>
  )
}
