import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, ScrollView, Button, } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import Search from '@/components/Ingredients/Search';
import IngredientsList from '@/components/Ingredients/IngredientsList';

const ingredients = () => {
  const { user } = useUser();

  useEffect(() => {
    sendUserIdToServer();
  }, [user]);

  const sendUserIdToServer = async () => {
    if (user) {
      try {
        await axios.post('http://192.168.1.253:3000/saveUserId', {
          userId: user.id,
        });
        console.log('User ID sent to server');
      } catch (error) {
        console.error('Error sending User ID to server:', error);
      }
    }
  };

  const handleCancel = () => {
    setSelectedIngredients([]);
  };

  return (
    <View>
      <FlatList
        ListHeaderComponent={
          <View>
            <Search />
            <IngredientsList />
          </View>
        }
        contentContainerStyle={styles.contentContainer}
      />
      <View style={styles.buttonContainer}>
        <Button title="Confirm"  />
        <Button title="Cancel" onPress={handleCancel} color="red" />
      </View>
    </View>
  );
};

export default ingredients;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 11,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: -5,
  },
  column: {
    flex: 1,
    paddingHorizontal: 4,
  },
  emptyColumn: {
    flex: 1,
  },
  recipeContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    marginBottom: 16,
    borderColor: '#000',
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: 150,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 8,
    textAlign: 'center',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});