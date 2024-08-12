import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import axios from 'axios';
import { useUser } from '@clerk/clerk-expo';

export default function MenuDetail() {
  const navigation = useNavigation();
  const { recipe_id } = useLocalSearchParams();
  const [recipeDetails, setRecipeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      if (!user || !user.id) {
        setError('User information not available. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`https://fridge-to-feast-new-e0bee58d224d.herokuapp.com/recipe_details?recipe_id=${recipe_id}&user_id=${user.id}`);
        setRecipeDetails(response.data);
      } catch (error) {
        console.error('Error fetching recipe details:', error);
        setError('Failed to fetch recipe details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [recipe_id, user]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: recipeDetails?.recipe_name || 'Recipe Details',
    });
  }, [navigation, recipeDetails]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!recipeDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No recipe details found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: recipeDetails.image_path }} 
          style={styles.image}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.recipeName}>{recipeDetails.recipe_name}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.sectionTitle}>Ingredients:</Text>
        <Text style={styles.ingredients}>{recipeDetails.required_ingredients}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.sectionTitle}>Instructions:</Text>
        <Text style={styles.instructions}>{recipeDetails.instructions}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.sectionTitle}>Cooking Method:</Text>
        <Text style={styles.cookingMethod}>{recipeDetails.cooking_method_name}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 15,
  },
  textContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  recipeName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
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
  ingredientCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  missingIngredients: {
    fontSize: 16,
    color: 'red',
  },
});