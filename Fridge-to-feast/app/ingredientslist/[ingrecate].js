import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import IngredientsListCard from '@/components/IngredientsList/IngredientsListCard';

export default function IngredientsListByCategory() {
    const navigation = useNavigation();
    const { category_name, category_id } = useLocalSearchParams();
    const [ingredientsList, setIngredientsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: category_name,
        });
        if (category_id) {
            getIngredientsList();
        }
    }, [category_id]);

    const getIngredientsList = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://fridge-to-feast-new-e0bee58d224d.herokuapp.com/ingredients_by_category/?category_name=${category_name}`);
            const data = await response.json();
            // console.log(data);
            setIngredientsList(data);
        } catch (error) {
            console.error('Error fetching menu list:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View>
            {ingredientsList.length > 0 ? (
                <FlatList
                    data={ingredientsList}
                    onRefresh={getIngredientsList}
                    refreshing={loading}
                    renderItem={({ item }) => (
                        <IngredientsListCard
                            menu={item}
                            ingredients={item.ingredients || []}
                        />
                    )}
                    keyExtractor={(item) => item.ingredient_id.toString()}
                />
            ) : (
                <Text>No data found</Text>
            )}
        </View>
    );
}
