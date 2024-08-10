import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react'; // เพิ่มการ import useState และ useEffect
import { Colors } from '@/constants/Colors';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter } from 'expo-router'; // เพิ่มการ import useRouter

export default function Search() {
  const [ingredients, setIngredients] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch('http://192.168.1.253:3000/ingredients')
      .then(response => response.json())
      .then(data => {
        setIngredients(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <View style={{
      backgroundColor: Colors.PRIMARY,
    }}>
      <View style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}>
        <Text style={styles.headerText}>Fridge to Feast</Text>
      </View>
      <TouchableOpacity style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 10,}}
        onPress={() => router.push({
          pathname: '/search/[search].js',  // กำหนดเส้นทางไปยังหน้าค้นหา
          params: { ingredients: JSON.stringify(ingredients) }  // ส่งข้อมูล ingredients ไปด้วย
        })}
        >
        <FontAwesome5 name="search" size={24} color={Colors.PRIMARY} />
        {/* <TextInput placeholder="Search" /> */}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerText: {
    paddingTop: 30,
    fontSize: 40,
    color: '#fff',
    fontFamily: 'outfit-bold',
  },
});
