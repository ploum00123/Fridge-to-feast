import { View, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors } from '@/constants/Colors';
import CategoryItem from './CategoryItem';
import { useRouter } from 'expo-router';

export default function Category() {
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch('http://192.168.1.253:3000/categories')
      .then(response => response.json())
      .then(data => {
        setCategories(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <View>
      <View style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
      }}>
        <Text style={{
          paddingLeft: 20,
          marginTop: 10,
          fontFamily: 'outfit-bold',
          fontSize: 20,
        }}>Category</Text>
        <Text style={{ color: Colors.PRIMARY, fontFamily: 'outfit-medium' }}>View All</Text>
      </View>
      <FlatList
        data={categories}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <CategoryItem
            category={item}
            key={index}
            onCategoryPress={() => router.push({
              pathname: '/menulist/' + item.category_name,
              params: { category_id: item.category_id, category_name: item.category_name } // ส่ง category_id และ category_name ไปยังหน้ารายการเมนู
            })}
          />
        )}
      />
    </View>
  )
}
