import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { useLocalSearchParams, useNavigation } from 'expo-router';

export default function MenuListByCategory() {
    const navigation = useNavigation();
    const { category_name, category_id } = useLocalSearchParams();

    useEffect(()=>{
        navigation.setOptions({
            headerShown:true,
            headerTitle:category_name,
        })
        getMenuList();
    },[]);
    
    //ดึงข้อมูลจาก API มาแสดงตาราง menu โดยแสดงเฉพาะ category ที่เลือก
    const getMenuList = async () => {
        try {
            const response = await fetch(`http://192.168.1.253:3000/recipes/?category_id=${category_id}`);
            const data = await response.json();
            console.log(data);
            // Process the data and display the menu table
        } catch (error) {
            console.error(error);
        }
    }
    
    
  return (
    <View>
      <Text>{category_name}</Text>
    </View>
  )
}