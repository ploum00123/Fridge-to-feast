import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [ingredients, setIngredients] = useState({});
    const router = useRouter(); 

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await axios.get('http://192.168.1.253:3000/recipes');
                setRecipes(response.data);

                // Fetch ingredients for each recipe
                await Promise.all(
                    response.data.map(async (recipe) => {
                        const ingredientsResponse = await axios.get(`http://192.168.1.253:3000/recipe_ingredients/?recipe_id=${recipe.recipe_id}`);
                        setIngredients(prev => ({
                            ...prev,
                            [recipe.recipe_id]: ingredientsResponse.data
                        }));
                    })
                );
            } catch (error) {
                console.error(error);
            }
        };

        fetchRecipes();
    }, []);

    const formatIngredients = (ingredients = []) => {
        const chunkSize = 5;
        const chunks = [];
        for (let i = 0; i < ingredients.length; i += chunkSize) {
            chunks.push(ingredients.slice(i, i + chunkSize).map(ing => ing.ingredient_name).join(', '));
        }
        return chunks;
    };

    const renderItem = ({ item }) => (
        <Pressable 
            style={styles.recipeContainer}
            onPress={() => router.push({
                pathname: `/menudetail/${item.recipe_id}`,
                params: { 
                    recipe_id: item.recipe_id, 
                    recipe_name: item.recipe_name, 
                    ingredients: formatIngredients(ingredients[item.recipe_id] || []).join(', '), 
                    image_path: item.image_path, 
                    instructions: item.instructions, 
                    cooking_method: item.cooking_method 
                }
            })}
        >
            {item.image_path && <Image source={{ uri: item.image_path }} style={styles.image} />}
            {item.recipe_name && <Text style={styles.recipeName}>{item.recipe_name}</Text>}
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
        <View>
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
                keyExtractor={(item, index) => item[0].recipe_id.toString()}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 11,
    },
    heading: {
        fontSize: 30,
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
        height: 200,
    },
    recipeName: {
        fontSize: 20,
        fontWeight: 'bold',
        padding: 8,
        textAlign: 'center',
    },
    contentContainer: {
        paddingBottom: 20,
    },
});
