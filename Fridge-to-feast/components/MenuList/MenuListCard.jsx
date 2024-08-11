import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

export default function MenuListCard({ menu }) {
    const router = useRouter();

    const isComplete = menu.matched_essential_ingredients_count === menu.total_essential_ingredients;

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
                <Text style={{
                    fontFamily: 'outfit-medium',
                    color: Colors.GRAY,
                    marginTop: 5,
                }}>
                    วัตถุดิบหลักที่มี: {menu.matched_essential_ingredients_count}/{menu.total_essential_ingredients}
                </Text>
                {!isComplete && menu.missing_essential_ingredients.length > 0 && (
                    <Text style={{
                        fontFamily: 'outfit-medium',
                        color: 'red',
                        marginTop: 2,
                    }}>
                        ขาดวัตถุดิบหลัก: {menu.missing_essential_ingredients.join(', ')}
                    </Text>
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