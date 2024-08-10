import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

export default function MenuListCard({ menu, ingredients }) {
    const formatIngredients = (ingredients) => {
        const chunkSize = 5; // Number of ingredients per line
        const chunks = [];
        for (let i = 0; i < ingredients.length; i += chunkSize) {
            chunks.push(ingredients.slice(i, i + chunkSize).map(ing => ing.ingredient_name).join(', '));
        }
        return chunks;
    };

    const router = useRouter();

    return (
        <TouchableOpacity 
            style={{
                padding: 10,
                margin: 10,
                borderWidth: 1,
                borderColor: '#000',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'row',
                gap: 10,
            }}
            onPress={() => router.push({
                pathname: `/menudetail/${menu.recipe_id}`,
                params: { 
                    recipe_id: menu.recipe_id, 
                    recipe_name: menu.recipe_name, 
                    ingredients: formatIngredients(ingredients).join(', '), 
                    image_path: menu.image_path, 
                    instructions: menu.instructions, 
                    cooking_method: menu.cooking_method 
                }
            })}
        >
            <Image 
                source={{ uri: menu.image_path }} 
                style={{ width: 100, height: 100, borderRadius: 15 }}
            />
            <View>
                <Text style={{
                    fontFamily: 'outfit-bold',
                    fontSize: 20,
                }}>{menu.recipe_name}</Text>
                <Text style={{
                    fontFamily: 'outfit-medium',
                    color: Colors.GRAY,
                    marginTop: 5,
                }}>
                    Ingredients:
                </Text>
                {ingredients.length > 0 
                    ? formatIngredients(ingredients).map((line, index) => (
                        <Text key={index} style={{
                            fontFamily: 'outfit-medium',
                            color: Colors.GRAY,
                            marginTop: index === 0 ? 0 : 2, // Add marginTop if not the first line
                        }}>
                            {line}
                        </Text>
                    ))
                    : <Text style={{
                        fontFamily: 'outfit-medium',
                        color: Colors.GRAY,
                    }}>No ingredients</Text>
                }
            </View>
        </TouchableOpacity>
    );
}
