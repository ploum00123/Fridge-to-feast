import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Colors } from '@/constants/Colors'
import CategoryItem from './CategoryItem';

export default function Category() {
  //ดึงข้อมูลจาก API มาแสดงตาราง category
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // setCategories([])
    fetch('http://192.168.1.253:3000/categories') // Replace with your API endpoint
      .then(response => response.json())
      .then(data => {
        setCategories(data);
        //console.log(data); // Log the fetched data to the console
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <View>
      <View style={{padding:20, display:'flex',
        flexDirection:'row',
        justifyContent: 'space-between',
        marginTop: 10,
      }}>
        <Text style={{paddingLeft:20,
          marginTop: 10,
          fontFamily: 'outfit-bold',
          fontSize: 20,

        }}>Category</Text>
        <Text style={{color:Colors.PRIMARY,fontFamily:'outfit-medium'}}>View All</Text>
      </View>
      <FlatList 
        data={categories}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({item, index}) => (
          <CategoryItem category={item} key={index}/>
        )}
      />
    </View>
  )
}