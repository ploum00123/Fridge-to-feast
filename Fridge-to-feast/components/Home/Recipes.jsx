import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [ingredients, setIngredients] = useState({});
  const [cookingMethods, setCookingMethods] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [recommendedResponse, allRecipesResponse, cookingMethodsResponse] = await Promise.all([
          axios.get(`http://192.168.1.253:3000/api/recipes?userId=${user.id}`),
          axios.get('http://192.168.1.253:3000/recipes'),
          axios.get('http://192.168.1.253:3000/cook_methods')
        ]);

        setRecipes(recommendedResponse.data);
        setAllRecipes(allRecipesResponse.data);

        // Create a mapping of cooking_method_id to cooking_method_name
        const methodsMap = {};
        cookingMethodsResponse.data.forEach(method => {
          methodsMap[method.cooking_method_id] = method.cooking_method_name;
        });
        setCookingMethods(methodsMap);

        // Fetch ingredients for each recipe
        const ingredientsPromises = recommendedResponse.data.map(recipe =>
          axios.get(`http://192.168.1.253:3000/recipe_ingredients/?recipe_id=${recipe.recipe_id}`)
        );
        const ingredientsResponses = await Promise.all(ingredientsPromises);
        const ingredientsData = {};
        ingredientsResponses.forEach((response, index) => {
          ingredientsData[recommendedResponse.data[index].recipe_id] = response.data;
        });
        setIngredients(ingredientsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const formatIngredients = (recipeIngredients) => {
    return recipeIngredients.map(ing => ing.ingredient_name);
  };

  const renderItem = ({ item }) => {
    const isComplete = item.matched_essential_ingredients_count === item.total_essential_ingredients;
    const recipeIngredients = ingredients[item.recipe_id] || [];
    const fullRecipeDetails = allRecipes.find(r => r.recipe_id === item.recipe_id) || {};
    const cookingMethodName = cookingMethods[item.cooking_method_id] || 'Unknown';

    return (
      <Pressable
        style={[
          styles.recipeContainer,
          isComplete ? styles.completeRecipe : styles.incompleteRecipe
        ]}
        onPress={() => router.push({
          pathname: `/menudetail/${item.recipe_id}`,
          params: { 
            recipe_id: item.recipe_id, 
            recipe_name: item.recipe_name, 
            ingredients: formatIngredients(recipeIngredients).join(', '), 
            image_path: item.image_path, 
            instructions: fullRecipeDetails.instructions, 
            cooking_method: cookingMethodName
          }
        })}
      >
        <Image source={{ uri: item.image_path }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.recipeName} numberOfLines={2}>{item.recipe_name}</Text>
          <Text style={styles.ingredientCount}>
            วัตถุดิบหลักที่มี: {item.matched_essential_ingredients_count}/{item.total_essential_ingredients}
          </Text>
          {!isComplete && item.missing_essential_ingredients && item.missing_essential_ingredients.length > 0 && (
            <Text style={styles.missingIngredients}>
              ขาดวัตถุดิบหลัก: {item.missing_essential_ingredients.join(', ')}
            </Text>
          )}
          <Text style={styles.cookingMethod}>วิธีทำ: {cookingMethodName}</Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>เมนูแนะนำ</Text>
      {recipes.length > 0 ? (
        <FlatList
          data={recipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.recipe_id.toString()}
          contentContainerStyle={styles.contentContainer}
          numColumns={2}
          columnWrapperStyle={styles.row}
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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
  },
  ingredientCount: {
    fontSize: 12,
    color: '#444',
    marginBottom: 2,
  },
  cookingMethod: {
    fontSize: 12,
    color: '#444',
    marginTop: 2,
  },
  missingIngredients: {
    fontSize: 12,
    color: 'red',
    marginTop: 2,
  },
  completeIngredients: {
    fontSize: 12,
    color: 'green',
    marginTop: 2,
  },
  row: {
    justifyContent: 'space-between',
  },
  recipeContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  missingIngredients: {
    fontSize: 12,
    color: 'red',
    marginBottom: 2,
  },
  ingredientCount: {
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
