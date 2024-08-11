import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userIngredients, setUserIngredients] = useState([]);
  const [userCookingMethods, setUserCookingMethods] = useState([]);
  const [ingredientsMap, setIngredientsMap] = useState({});
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (user) {
          // Fetch recipes
          const recipesResponse = await axios.get('http://192.168.1.253:3000/recipes');
          const fetchedRecipes = recipesResponse.data;

          // Fetch ingredients for each recipe
          const ingredientsPromises = fetchedRecipes.map(async (recipe) => {
            const ingredientsResponse = await axios.get(`http://192.168.1.253:3000/recipe_ingredients/?recipe_id=${recipe.recipe_id}`);
            return { recipe_id: recipe.recipe_id, ingredients: ingredientsResponse.data };
          });

          const ingredientsArray = await Promise.all(ingredientsPromises);
          const ingredientsObject = ingredientsArray.reduce((acc, curr) => {
            acc[curr.recipe_id] = curr.ingredients;
            return acc;
          }, {});

          setIngredientsMap(ingredientsObject);
          setRecipes(fetchedRecipes);

          // Fetch user's ingredients
          const userIngredientsResponse = await axios.get(`http://192.168.1.253:3000/user_ingredients/${user.id}`);
          setUserIngredients(userIngredientsResponse.data);

          // Fetch user's cooking methods
          const userCookingMethodsResponse = await axios.get(`http://192.168.1.253:3000/user_cookmethods/${user.id}`);
          setUserCookingMethods(userCookingMethodsResponse.data.map(method => method.cooking_method_id));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const renderItem = ({ item }) => {
    const isComplete = item.matched_ingredients_count === item.total_ingredients && userCookingMethods.includes(item.cooking_method_id);
    const userIngredientNames = userIngredients.map(ing => ing.ingredient_name);
    const missingEssentialIngredients = ingredientsMap[item.recipe_id]?.filter(ingredient => !userIngredientNames.includes(ingredient.ingredient_name)) || [];

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
            ingredients: item.required_ingredients,
            image_path: item.image_path,
            instructions: item.instructions,
            cooking_method: item.cooking_method
          }
        })}
      >
        <Image source={{ uri: item.image_path }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.recipeName} numberOfLines={2}>{item.recipe_name}</Text>
          {missingEssentialIngredients.length > 0 && (
            <Text style={styles.missingIngredients}>
              ขาดวัตถุดิบหลัก: {missingEssentialIngredients.map(ing => ing.ingredient_name).join(', ')}
            </Text>
          )}
          <Text style={styles.ingredientCount}>
            วัตถุดิบที่ตรงกัน: {item.matched_ingredients_count}/{item.total_ingredients}
          </Text>
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
      <Text style={styles.heading}>Recommended Recipes</Text>
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
        <Text style={styles.noRecipesText}>No recipes available</Text>
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
