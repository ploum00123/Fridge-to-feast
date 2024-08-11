import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import MenuListCard from '@/components/MenuList/MenuListCard';
import { useUser } from '@clerk/clerk-expo';

export default function MenuListByCategory() {
    const navigation = useNavigation();
    const { category_name, category_id } = useLocalSearchParams();
    const [menuList, setMenuList] = useState([]);
    const [ingredients, setIngredients] = useState({});
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: category_name,
        });
        if (category_id && user) {
            getMenuList();
        }
    }, [category_id, user]);

    const getMenuList = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://192.168.1.253:3000/recipes/?category_id=${category_id}`);
            const data = await response.json();
            console.log(data);
            setMenuList(data);
            // ดึงข้อมูล ingredients และข้อมูลเพิ่มเติมของแต่ละเมนู
            await Promise.all(data.map(menu => getRecipeDetails(menu.recipe_id)));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getRecipeDetails = async (recipeId) => {
        try {
            const response = await fetch(`http://192.168.1.253:3000/recipe_details/?recipe_id=${recipeId}&user_id=${user.id}`);
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
                    onRefresh={getMenuList}
                    refreshing={loading}
                    renderItem={({ item }) => (
                        <MenuListCard
                            menu={{...item, ...ingredients[item.recipe_id]}}
                            key={item.recipe_id}
                        />
                    )}
                />
            ) : (
                <Text>No recipes found in this category</Text>
            )}
        </View>
    );
}