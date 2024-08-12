import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function Ingredients() {
    const [ingredients, setIngredients] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const response = await axios.get('https://fridge-to-feast-new-e0bee58d224d.herokuapp.com/ingredients');
                setIngredients(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchIngredients();
    }, []);

    const handleIngredientPress = (ingredient) => {
        router.push({
            pathname: '/ingredientdetail/[ingre]',
            params: {
                recipe_name: ingredient.ingredient_name,
                image_path: ingredient.ingredient_image,
                recipe_id: ingredient.ingredient_id.toString()
            }
        });
    };

    const renderItem = ({ item }) => (
        <Pressable 
            style={styles.ingredientContainer}
            onPress={() => handleIngredientPress(item)}
        >
            {item.ingredient_image && <Image source={{ uri: item.ingredient_image }} style={styles.image} />}
            {item.ingredient_name && <Text style={styles.ingredientName}>{item.ingredient_name}</Text>}
        </Pressable>
    );

    const chunkArray = (array, size) => {
        const chunkedArr = [];
        for (let i = 0; i < array.length; i += size) {
            chunkedArr.push(array.slice(i, i + size));
        }
        return chunkedArr;
    };

    const chunkedData = chunkArray(ingredients, 2);

    return (
        <View>
            <Text style={styles.heading}>Ingredients</Text>
            <FlatList
                data={chunkedData}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        {item.map((ingredient) => (
                            <View key={ingredient.ingredient_id} style={styles.column}>
                                {renderItem({ item: ingredient })}
                            </View>
                        ))}
                        {item.length === 1 && <View style={[styles.column, styles.emptyColumn]} />}
                    </View>
                )}
                keyExtractor={(item, index) => item[0].ingredient_id.toString()}
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