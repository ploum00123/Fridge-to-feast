import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';

const Recipes = () => {
    
    const [recipes, setRecipes] = useState([]);
    useEffect(() => {
        const fetchRecipes = async () => {
            try {
            const response = await fetch('http://192.168.1.253:3000/recipes');
            const data = await response.json();
            setRecipes(data);
            } catch (error) {
            console.error(error);
            }
        };

        fetchRecipes();
    }, []);

    const renderItem = ({ item }) => (
        <Pressable style={styles.recipeContainer}>
          <Image source={{ uri: item.image_path }} style={styles.image} />
          <Text style={styles.recipeName}>{item.recipe_name}</Text>
        </Pressable>
      );
    
      const chunkArray = (array, size) => {
        const chunkedArr = [];
        for (let i = 0; i < array.length; i += size) {
          chunkedArr.push(array.slice(i, i + size));
        }
        return chunkedArr;
      };
    
      const chunkedData = chunkArray(recipes, 2);
    
      return (
        <View style={styles.container}>
          <Text style={styles.heading}>Recipes</Text>
          <FlatList
            data={chunkedData}
            renderItem={({ item }) => (
              <View style={styles.row}>
                {item.map((recipe) => (
                  <View key={recipe.recipe_id} style={styles.column}>
                    {renderItem({ item: recipe })}
                  </View>
                ))}
                {item.length === 1 && <View style={[styles.column, styles.emptyColumn]} />}
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
}

export default Recipes

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
  });
  