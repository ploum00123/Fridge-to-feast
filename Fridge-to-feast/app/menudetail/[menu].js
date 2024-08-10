import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';

export default function MenuDetail() {
  const navigation = useNavigation();
  const { recipe_name, ingredients, image_path, instructions, cooking_method } = useLocalSearchParams();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,  // Ensure the header is shown
      title: recipe_name, // Set the title of the header to the recipe name
    });
  }, [navigation, recipe_name]);

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
      <View style={styles.textContainer}>
        <Text style={styles.ingredients}>Ingredients: {ingredients}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.instructions}>Instructions: {instructions}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cookingMethod}>Cooking Method: {cooking_method}</Text>
      </View>
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
  ingredients: {
    fontSize: 16,
  },
  instructions: {
    fontSize: 16,
  },
  cookingMethod: {
    fontSize: 16,
  },
});
