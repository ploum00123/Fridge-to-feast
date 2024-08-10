import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Colors } from '@/constants/Colors';

export default function SearchPage() {
  const { ingredients } = useLocalSearchParams();
  const navigation = useNavigation();
  const parsedIngredients = JSON.parse(ingredients) || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState(parsedIngredients);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Search Results',
    });
  }, [navigation]);

  // Filter ingredients based on the search query and remove any ingredients without necessary data
  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = parsedIngredients
      .filter(ingredient =>
        ingredient.ingredient_name?.toLowerCase().includes(query.toLowerCase()) &&
        ingredient.ingredient_name && ingredient.ingredient_image // Ensure both name and image exist
      );
    setFilteredIngredients(filtered);
  };

  const renderItem = ({ item }) => (
    <Pressable style={styles.ingredientContainer}>
      <Image source={{ uri: item.ingredient_image }} style={styles.image} />
      <Text style={styles.ingredientName}>{item.ingredient_name}</Text>
    </Pressable>
  );

  const chunkArray = (array, size) => {
    const chunkedArr = [];
    for (let i = 0; i < array.length; i += size) {
      chunkedArr.push(array.slice(i, i + size));
    }
    return chunkedArr;
  };

  const chunkedData = chunkArray(filteredIngredients, 2);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={24} color={Colors.PRIMARY} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search Ingredients"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      <Text style={styles.heading}>Ingredients</Text>
      <FlatList
        data={chunkedData}
        renderItem={({ item, index }) => (
          <View key={`row-${index}`} style={styles.row}>
            {item.map((ingredient) => (
              <View key={ingredient.ingredient_id?.toString()} style={styles.column}>
                {renderItem({ item: ingredient })}
              </View>
            ))}
          </View>
        )}
        keyExtractor={(item, index) => `ingredient-row-${index}`}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  column: {
    flex: 0.48,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    alignItems: 'center',
  },
  ingredientContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  image: {
    width: '100%',
    height: 60,
    borderRadius: 10,
  },
  ingredientName: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
