import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function IngredientsListCard({ menu, ingredients }) {

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
                pathname: `/ingredientdetail/${menu.ingredient_id}`,
                params: { 
                    recipe_id: menu.ingredient_id, 
                    recipe_name: menu.ingredient_name, 
                    image_path: menu.ingredient_image, 
                }
            })}
        >
            <Image 
                source={{ uri: menu.ingredient_image }} 
                style={{ width: 100, height: 100, borderRadius: 15 }}
            />
            <View>
                <Text style={{
                    fontFamily: 'outfit-bold',
                    fontSize: 20,
                }}>{menu.ingredient_name}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 11,
    },
    heading: {
        fontSize: 30,
        fontWeight: 'outfit-bold',
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
    ingredientContainer: {
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
    ingredientName: {
        fontSize: 20,
        fontWeight: 'bold',
        padding: 8,
        textAlign: 'center',
    },
    contentContainer: {
        paddingBottom: 20,
    },
});