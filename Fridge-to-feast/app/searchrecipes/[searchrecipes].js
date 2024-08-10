import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Colors } from '@/constants/Colors';

export default function SearchRecipesPage() {
  const { recipes, ingredients } = useLocalSearchParams();
  const navigation = useNavigation();
  const parsedRecipes = recipes ? JSON.parse(recipes) : [];
  const parsedIngredients = ingredients ? JSON.parse(ingredients) : {};
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState(parsedRecipes);
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Search Results',
    });
  }, [navigation]);

  // Filter recipes based on the search query
  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = parsedRecipes.filter(recipe =>
      recipe.recipe_name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRecipes(filtered);
  };

  const formatIngredients = (recipeId) => {
    const ingredients = parsedIngredients[recipeId] || [];
    const chunkSize = 5;
    const chunks = [];
    for (let i = 0; i < ingredients.length; i += chunkSize) {
      chunks.push(ingredients.slice(i, i + chunkSize).map(ing => ing.ingredient_name).join(', '));
    }
    return chunks;
  };

  const renderRecipe = ({ item }) => (
    <Pressable
      style={styles.recipeBox}
      onPress={() => router.push({
        pathname: `/menudetail/${item.recipe_id}`,
        params: {
          recipe_id: item.recipe_id,
          recipe_name: item.recipe_name,
          ingredients: formatIngredients(item.recipe_id).join(', '),
          image_path: item.image_path,
          instructions: item.instructions,
          cooking_method: item.cooking_method,
        }
      })}
    >
      {item.image_path && <Image source={{ uri: item.image_path }} style={styles.image} />}
      <Text style={styles.recipeText}>{item.recipe_name}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={24} color={Colors.PRIMARY} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search Recipes"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.recipe_id.toString()}
        numColumns={2} // Display items in 2 columns
        columnWrapperStyle={styles.row} // Apply style to rows
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginLeft: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recipeBox: {
    flex: 0.48,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  recipeText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  contentContainer: {
    paddingBottom: 20,
  },
});
