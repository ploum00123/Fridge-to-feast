import { View, Text, Image } from 'react-native';
import React from 'react';
import { Colors } from '@/constants/Colors';

export default function MenuListCard({ menu, ingredients }) {
    const formatIngredients = (ingredients) => {
        const chunkSize = 5; // กำหนดจำนวน ingredients ต่อบรรทัด
        const chunks = [];
        for (let i = 0; i < ingredients.length; i += chunkSize) {
            chunks.push(ingredients.slice(i, i + chunkSize).map(ing => ing.ingredient_name).join(', '));
        }
        return chunks;
    };

    return (
        <View style={{
            padding: 10,
            margin: 10,
            borderWidth: 1,
            borderColor: '#000',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'row',
            gap: 10,
        }}>
            <Image source={{ uri: menu.image_path }} 
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
                            marginTop: index === 0 ? 0 : 2, // เพิ่ม marginTop เมื่อไม่ใช่บรรทัดแรก
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
        </View>
    );
}
