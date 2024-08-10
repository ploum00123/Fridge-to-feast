import { View, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import IngredientsCategoryItem from './IngreItem';

export default function IngredientsCategory() {
  const [ingredient_categories, setIngredient_categories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch('http://192.168.1.253:3000/ingredient_categories')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setIngredient_categories(data); // เก็บข้อมูลที่ได้จาก API ใน state
        } else {
          console.error('Data format is incorrect:', data); // ตรวจสอบรูปแบบของข้อมูลที่ได้มา
        }
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
        data={ingredient_categories} // ใช้ข้อมูลที่ดึงมาจาก API
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <IngredientsCategoryItem
            category={item} // ส่งข้อมูลแต่ละหมวดหมู่ไปยัง component ที่จะ render
            onCategoryPress={() => router.push({
              pathname: '/ingredientslist/' + item.category_name,
              params: { category_name: item.category_name, category_id: item.ingredient_category_id } // ส่งข้อมูลเพิ่มเติมไปยังหน้า ingredientslist
            })}
          />
        )}
        keyExtractor={(item) => item.ingredient_category_id.toString()} // ใช้ ingredient_category_id เป็น key สำหรับแต่ละ item
      />
    </View>
  )
}
