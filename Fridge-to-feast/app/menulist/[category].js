import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import MenuListCard from '@/components/MenuList/MenuListCard';

export default function MenuListByCategory() {
    const navigation = useNavigation();
    const { category_name, category_id } = useLocalSearchParams();
    const [menuList, setMenuList] = useState([]);
    const [ingredients, setIngredients] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: category_name,
        });
        if (category_id) {
            getMenuList();
        }
    }, [category_id]);

    // ดึงข้อมูลจาก API มาแสดงตาราง menu โดยแสดงเฉพาะ category ที่เลือก
    const getMenuList = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://192.168.1.253:3000/recipes/?category_id=${category_id}`);
            const data = await response.json();
            console.log(data);
            setMenuList(data);
            // ดึงข้อมูล ingredients ของแต่ละเมนู
            await Promise.all(data.map(menu => getRecipeIngredients(menu.recipe_id)));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // ดึงข้อมูล ingredients สำหรับ recipe แต่ละรายการ
    const getRecipeIngredients = async (recipeId) => {
        try {
            const response = await fetch(`http://192.168.1.253:3000/recipe_ingredients/?recipe_id=${recipeId}`);
            const data = await response.json();
            setIngredients(prev => ({ ...prev, [recipeId]: data }));
        } catch (error) {
            console.error(error);
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
            {menuList.length > 0 ? (
                <FlatList
                    data={menuList}
                    renderItem={({ item }) => (
                        <MenuListCard
                            menu={item}
                            ingredients={ingredients[item.recipe_id] || []}
                            key={item.recipe_id}
                        />
                    )}
                />
            ) : (
                <Text>No data found</Text>
            )}
        </View>
    );
}
