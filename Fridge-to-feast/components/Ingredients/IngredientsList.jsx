import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

export default function IngredientsList() {

    const [ingredients, setIngredients] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchIngredients();
        fetchCategories();
    }, []);

    const fetchIngredients = async () => {
        try {
            const response = await axios.get('http://192.168.1.253:3000/ingredients');
            setIngredients(response.data);
            setFilteredItems(response.data); // กำหนดค่าเริ่มต้นของ filteredItems
            //console.log(response.data); // Display ingredients data in console
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://192.168.1.253:3000/categories');
            setCategories(response.data);
            //console.log(response.data); // Display categories data in console
        } catch (error) {
            console.error(error);
        }
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        if (category === '') {
            setFilteredItems(ingredients); // แสดงทั้งหมดถ้าไม่เลือกหมวดหมู่
        } else {
            setFilteredItems(ingredients.filter(item => item.ingredient_category === category));
        }
    };

    const renderItem = ({ item }) => (
        <Pressable style={styles.recipeContainer}>
            {item.ingredient_image && <Image source={{ uri: item.ingredient_image }} style={styles.image} />}
            {item.ingredient_name && <Text style={styles.recipeName}>{item.ingredient_name}</Text>}
        </Pressable>
    );

    const chunkArray = (array, size) => {
        const chunkedArr = [];
        for (let i = 0; i < array.length; i += size) {
            chunkedArr.push(array.slice(i, i + size));
        }
        return chunkedArr;
    };

    const chunkedData = chunkArray(filteredItems, 2);

    return (
        <View style={styles.container}>
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
                keyExtractor={(item, index) => item[0]?.ingredient_id.toString()}  // Ensure item[0] is not undefined
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
    pickerContainer: {
        marginBottom: 16,  // เพิ่มระยะห่างด้านล่าง
    },
    heading: {
        fontSize: 30,
        fontWeight: 'bold',  // Adjusted fontWeight
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
        borderRadius: 4,
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
    picker: {
        height: 50,
        width: '100%',
    },
});
