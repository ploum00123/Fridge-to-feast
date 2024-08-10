import { View, Text, StyleSheet, TextInput } from 'react-native';
import React, { useState } from 'react';
import { Colors } from '@/constants/Colors';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';

export default function SearchBar() {
    const navigation = useNavigation();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState(items);
    const [items, setItems] = useState([]);

    const handleSearch = (text) => {
        setSearchTerm(text);
        const normalizedText = text.toLowerCase();
        setFilteredItems(items.filter(item => item.Ingredient_name.toLowerCase().includes(normalizedText)));
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
          headerLargeTitle: true,
        });
      }, [navigation, items, searchTerm]);

  return (
    <View style={{
      backgroundColor: Colors.PRIMARY,
    }}>
      <View style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}>
        <Text style={styles.headerText}>Ingredients</Text>
      </View>
      <View style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 10,
      }}>
        <FontAwesome5 name="search" size={24} color={Colors.PRIMARY} />
        <TextInput placeholder="Search"
            value={searchTerm}
            onChangeText={(text) => handleSearch(text)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerText: {
    paddingTop: 30,
    fontSize: 40,
    color: '#fff',
    fontFamily: 'outfit-bold',
  },
});
