import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';

export default function MenuListCard({ menu }) {
    const router = useRouter();
    const { user } = useUser();
    const [ingredientStatus, setIngredientStatus] = useState(null);

    useEffect(() => {
        const fetchIngredientStatus = async () => {
            try {
                const response = await axios.get(`https://fridge-to-feast-new-e0bee58d224d.herokuapp.com/recipe_ingredient_status?recipe_id=${menu.recipe_id}&user_id=${user.id}`);
                setIngredientStatus(response.data);
            } catch (error) {
                console.error('Error fetching ingredient status:', error);
            }
        };

        fetchIngredientStatus();
    }, [menu.recipe_id, user.id]);

    const isComplete = ingredientStatus && ingredientStatus.matched_essential_ingredients_count === ingredientStatus.total_essential_ingredients;

    return (
        <TouchableOpacity 
            style={{
                padding: 10,
                margin: 10,
                borderWidth: 1,
                borderColor: isComplete ? '#000' : '#ccc',
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
                    ingredients: menu.required_ingredients.join(', '),
                    image_path: menu.image_path, 
                    instructions: menu.instructions, 
                    cooking_method: menu.cooking_method_name
                }
            })}
        >
            <Image 
                source={{ uri: menu.image_path }} 
                style={{ width: 100, height: 100, borderRadius: 15 }}
            />
            <View style={{ flex: 1 }}>
                <Text style={{
                    fontFamily: 'outfit-bold',
                    fontSize: 20,
                }}>{menu.recipe_name}</Text>
                {ingredientStatus && (
                    <>
                        <Text style={{
                            fontFamily: 'outfit-medium',
                            color: Colors.GRAY,
                            marginTop: 5,
                        }}>
                            วัตถุดิบหลักที่มี: {ingredientStatus.matched_essential_ingredients_count}/{ingredientStatus.total_essential_ingredients}
                        </Text>
                        {!isComplete && ingredientStatus.missing_essential_ingredients.length > 0 && (
                            <Text style={{
                                fontFamily: 'outfit-medium',
                                color: 'red',
                                marginTop: 2,
                            }}>
                                ขาดวัตถุดิบหลัก: {ingredientStatus.missing_essential_ingredients.join(', ')}
                            </Text>
                        )}
                    </>
                )}
                <Text style={{
                    fontFamily: 'outfit-medium',
                    color: Colors.GRAY,
                    marginTop: 2,
                }}>
                    วิธีทำ: {menu.cooking_method_name}
                </Text>
            </View>
        </TouchableOpacity>
    );
}