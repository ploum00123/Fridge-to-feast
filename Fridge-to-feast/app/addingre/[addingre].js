import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import axios from 'axios';
import { useUser } from '@clerk/clerk-expo';

export default function AddIngredient() {
  const [loading, setLoading] = useState(false);
  const [userIngredients, setUserIngredients] = useState([]);
  const navigation = useNavigation();
  const { user } = useUser();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Your Ingredients',
    });
    fetchUserIngredients();
  }, []);

  const fetchUserIngredients = async () => {
    try {
      const response = await axios.get(`http://192.168.1.253:3000/user_ingredients/${user.id}`);
      setUserIngredients(response.data);
    } catch (error) {
      console.error('Error fetching user ingredients:', error);
    }
  };

  const handleDeleteIngredient = async (ingredientId) => {
    setLoading(true);
    try {
      await axios.delete(`http://192.168.1.253:3000/delete_ingredient`, {
        data: {
          user_id: user.id,
          ingredient_id: ingredientId,
        }
      });
      alert('Ingredient deleted from your refrigerator!');
      fetchUserIngredients(); // Refresh the list
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      alert('Failed to delete ingredient');
    } finally {
      setLoading(false);
    }
  };

  const renderIngredientItem = ({ item }) => (
    <View style={styles.ingredientItem}>
      <Text style={styles.ingredientName}>{item.ingredient_name}</Text>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteIngredient(item.ingredient_id)}
      >
        <Text style={styles.deleteButtonText}>delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>วัตถุดิบของคุณ</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={userIngredients}
          renderItem={renderIngredientItem}
          keyExtractor={item => item.ingredient_id.toString()}
          style={styles.list}
        />
      )}
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
  list: {
    width: '100%',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  ingredientName: {
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});