import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Image, FlatList } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import axios from 'axios';

export default function AddIngredient() {
  const { recipe_name, recipe_id, image_path } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [userIngredients, setUserIngredients] = useState([]);
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Add Ingredient',
    });
    fetchUserIngredients();
  }, []);

  const fetchUserIngredients = async () => {
    try {
      const response = await axios.get(`http://192.168.1.253:3000/user_ingredients/${user.id}`); // Replace USER_ID with actual user ID
      setUserIngredients(response.data);
    } catch (error) {
      console.error('Error fetching user ingredients:', error);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await axios.post('http://192.168.1.253:3000/add_ingredient', {
        user_id: user.id, // Replace with actual user ID
        ingredient_id: recipe_id,
      });
      alert('Ingredient added to your refrigerator!');
      fetchUserIngredients(); // Refresh the list
    } catch (error) {
      console.error('Error adding ingredient:', error);
      alert('Failed to add ingredient');
    } finally {
      setLoading(false);
    }
  };

  const renderIngredientItem = ({ item }) => (
    <View style={styles.ingredientItem}>
      <Image source={{ uri: item.ingredient_image }} style={styles.ingredientImage} />
      <Text style={styles.ingredientName}>{item.ingredient_name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Ingredient</Text>
      <Image source={{ uri: image_path }} style={styles.image} />
      <Text style={styles.ingredientName}>{recipe_name}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Add to Ingredients" onPress={handleConfirm} />
      )}
      <Text style={styles.listTitle}>Your Ingredients:</Text>
      <FlatList
        data={userIngredients}
        renderItem={renderIngredientItem}
        keyExtractor={item => item.ingredient_id.toString()}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
  },
  ingredientName: {
    fontSize: 18,
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  list: {
    width: '100%',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ingredientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
});