import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

export default function Pick() {

    const [ingredients, setIngredients] = useState([]);
    const [, setFilteredItems] = useState([]);
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
            console.log(response.data); // Display categories data in console
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




    return (
        <View style={styles.pickerContainer}>
            <Picker
                selectedValue={selectedCategory}
                onValueChange={(itemValue) => handleCategoryChange(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="All" value="" />
                {categories && categories.length > 0 ? categories.map((category, index) => (
                    <Picker.Item key={index} label={category.category_name || "Unnamed Category"} value={category.category_name} />
                )) : null}
            </Picker>
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
