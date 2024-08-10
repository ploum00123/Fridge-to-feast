import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import axios from 'axios';
import { useUser } from '@clerk/clerk-expo';

export default function MenuDetail() {
  const navigation = useNavigation();
  const { recipe_name, image_path, recipe_id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: recipe_name,
    });
  }, [navigation, recipe_name]);

  const handleAddIngredient = async () => {
    try {
      await axios.post('http://192.168.1.253:3000/add_ingredient', {
        user_id: user.id, // Replace with actual user ID
        ingredient_id: recipe_id,
      });
      alert('Ingredient added successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding ingredient:', error);
      alert('Failed to add ingredient. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: image_path }} 
          style={styles.image}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.recipeName}>{recipe_name}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddIngredient} // Directly add ingredient
      >
        <Text style={styles.addButtonText}>Add to Ingredients</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
  },
  image: {
    width: 400,
    height: 400,
    borderRadius: 15,
  },
  textContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
  recipeName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
