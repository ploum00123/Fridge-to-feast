import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors } from '@/constants/Colors';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function Header() {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState({});
  const router = useRouter(); 

  useEffect(() => {
    const fetchRecipesAndIngredients = async () => {
      try {
        const response = await axios.get('http://192.168.1.253:3000/recipes');
        const fetchedRecipes = response.data;
        setRecipes(fetchedRecipes);

        // Fetch ingredients for each recipe
        const ingredientsPromises = fetchedRecipes.map(async (recipe) => {
          const response = await axios.get(`http://192.168.1.253:3000/recipe_ingredients/?recipe_id=${recipe.recipe_id}`);
          return { recipe_id: recipe.recipe_id, ingredients: response.data };
        });

        const ingredientsArray = await Promise.all(ingredientsPromises);
        const ingredientsObject = ingredientsArray.reduce((acc, curr) => {
          acc[curr.recipe_id] = curr.ingredients;
          return acc;
        }, {});
        
        setIngredients(ingredientsObject);
      } catch (error) {
        console.error('Error fetching data:', error.message);
        if (error.response) {
          console.error('Data:', error.response.data);
          console.error('Status:', error.response.status);
          console.error('Headers:', error.response.headers);
        } else if (error.request) {
          console.error('Request:', error.request);
        } else {
          console.error('Error Message:', error.message);
        }
        console.error('Config:', error.config);
      }
    };

    fetchRecipesAndIngredients();
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
          pathname: '/searchrecipes/[searchrecipes].js',  // กำหนดเส้นทางไปยังหน้าค้นหา
          params: { 
            recipes: JSON.stringify(recipes),
            ingredients: JSON.stringify(ingredients)  // ส่งข้อมูล ingredients ไปด้วย
          }  
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
