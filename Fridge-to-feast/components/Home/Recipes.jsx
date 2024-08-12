import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, ActivityIndicator, RefreshControl, Button } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

export default function Recipes({ refreshTrigger }) {
  const [recipes, setRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [ingredients, setIngredients] = useState({});
  const [cookingMethods, setCookingMethods] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllRecipes, setShowAllRecipes] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const fetchData = useCallback(async () => {
    if (!user || !user.id) {
      setError('User information not available. Please log in again.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [recommendedResponse, allRecipesResponse, cookingMethodsResponse] = await Promise.all([
        axios.get(`https://fridge-to-feast-new-e0bee58d224d.herokuapp.com/api/recipes?userId=${user.id}`),
        axios.get('https://fridge-to-feast-new-e0bee58d224d.herokuapp.com/recipes'),
        axios.get('https://fridge-to-feast-new-e0bee58d224d.herokuapp.com/cook_methods')
      ]);

      setRecipes(recommendedResponse.data);
      setAllRecipes(allRecipesResponse.data);
      
      const methodsMap = {};
      cookingMethodsResponse.data.forEach(method => {
        methodsMap[method.cooking_method_id] = method.cooking_method_name;
      });
      setCookingMethods(methodsMap);

      // Fetch ingredients for all recipes
      const ingredientsPromises = allRecipesResponse.data.map(recipe =>
        axios.get(`https://fridge-to-feast-new-e0bee58d224d.herokuapp.com/recipe_ingredients/?recipe_id=${recipe.recipe_id}`)
      );
      const ingredientsResponses = await Promise.all(ingredientsPromises);
      const ingredientsData = {};
      ingredientsResponses.forEach((response, index) => {
        ingredientsData[allRecipesResponse.data[index].recipe_id] = response.data;
      });
      setIngredients(ingredientsData);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      fetchData();
    } else {
      setError('User information not available. Please log in again.');
    }
  }, [user, fetchData, refreshTrigger]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, [fetchData]);

  const renderItem = ({ item }) => {
    const recipeIngredients = ingredients[item.recipe_id] || [];
    const cookingMethodName = cookingMethods[item.cooking_method_id] || 'Unknown';
    const isComplete = item.matched_essential_ingredients_count === item.total_essential_ingredients;

    return (
      <Pressable
        style={[styles.recipeContainer, isComplete ? styles.completeRecipe : styles.incompleteRecipe]}
        onPress={() => router.push({
          pathname: `/menudetail/${item.recipe_id}`,
          params: { recipe_id: item.recipe_id }
        })}
      >
        <Image source={{ uri: item.image_path }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.recipeName} numberOfLines={2}>{item.recipe_name}</Text>
          <Text style={styles.ingredientCount}>
            วัตถุดิบหลักที่มี: {item.matched_essential_ingredients_count}/{item.total_essential_ingredients}
          </Text>
          {!isComplete && item.missing_essential_ingredients && (
            <Text style={styles.missingIngredients} numberOfLines={3}>
              ขาดวัตถุดิบหลัก: {item.missing_essential_ingredients.join(', ')}
            </Text>
          )}
          <Text style={styles.cookingMethod}>วิธีทำ: {cookingMethodName}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button 
          title={showAllRecipes ? "แสดงเมนูแนะนำ" : "แสดงเมนูทั้งหมด"} 
          onPress={() => setShowAllRecipes(!showAllRecipes)}
        />
      </View>
      <Text style={styles.heading}>{showAllRecipes ? "เมนูทั้งหมด" : "เมนูแนะนำ"}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (showAllRecipes ? allRecipes : recipes).length > 0 ? (
        <FlatList
          data={showAllRecipes ? allRecipes : recipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.recipe_id.toString()}
          contentContainerStyle={styles.contentContainer}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <Text style={styles.noRecipesText}>ไม่พบเมนูอาหาร</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  buttonContainer: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recipeContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    width: '48%',
    overflow: 'hidden',
  },
  completeRecipe: {
    borderColor: '#000',
    borderWidth: 2,
  },
  incompleteRecipe: {
    borderColor: '#ccc',
    borderWidth: 2,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 8,
  },
  recipeName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ingredientCount: {
    fontSize: 12,
    color: '#444',
    marginBottom: 2,
  },
  missingIngredients: {
    fontSize: 11,
    color: 'red',
    marginBottom: 2,
  },
  cookingMethod: {
    fontSize: 12,
    color: '#444',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  noRecipesText: {
    textAlign: 'center',
    marginTop: 20,
  },
});