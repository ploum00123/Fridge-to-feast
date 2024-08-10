import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import SearchBar from '../../components/Ingredients/Search'; // ปรับให้ถูกต้องตาม path
import CategoryPicker from '../../components/Ingredients/Pick'; // ปรับให้ถูกต้องตาม path
import IngredientList from '../../components/Ingredients/IngredientsList'; // ปรับให้ถูกต้องตาม path

export default function AddIngredient() {
  const { user } = useUser();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [existingIngredients, setExistingIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchIngredients();
    fetchCategories();
    fetchExistingIngredients();
  }, []);

  const fetchIngredients = () => {
    fetch('http://192.168.1.253:3000/ingredients')
      .then(res => res.json())
      .then((result) => {
        setItems(result);
        setFilteredItems(result);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching ingredients:', error);
        setIsLoading(false);
      });
  };

  const fetchCategories = () => {
    fetch('http://192.168.1.253:3000/categories')
      .then(res => res.json())
      .then((result) => {
        setCategories(result);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  };

  const fetchExistingIngredients = () => {
    const userId = user.id;

    fetch(`http://192.168.1.253:3000/user_ingredients?userId=${userId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(result => {
        setExistingIngredients(result.map(item => item.ingredient_id));
      })
      .catch(error => {
        console.error('Error fetching user ingredients:', error);
      });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === '') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.ingredient_type === category));
    }
  };

  const toggleIngredient = (ingredient) => {
    setSelectedIngredients((prevSelected) => {
      if (prevSelected.includes(ingredient.ingredient_name)) {
        return prevSelected.filter((item) => item !== ingredient.ingredient_name);
      } else {
        return [...prevSelected, ingredient.ingredient_name];
      }
    });
  };

  const handleConfirm = () => {
    const newIngredients = selectedIngredients.filter(name => !existingIngredients.includes(name));
    if (newIngredients.length === 0) {
      alert('All selected ingredients already exist in the list');
      return;
    }

    fetch('http://192.168.1.253:3000/add_ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ingredient_ids: newIngredients,
        userId: user.id,
      }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setSelectedIngredients([]);
          fetchExistingIngredients();
          navigation.navigate('Home');
        } else {
          alert(`วัตถุดิบที่คุณเพิ่ม มีอยู่แล้ว`);
        }
      })
      .catch(error => {
        console.error('Error sending data:', error);
        alert(`Error sending data: ${error.message}`);
      });
  };

  const handleCancel = () => {
    setSelectedIngredients([]);
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    const normalizedText = text.toLowerCase();
    setFilteredItems(items.filter(item => item.ingredient_name.toLowerCase().includes(normalizedText)));
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedIngredients.includes(item.ingredient_name);
    return (
      <Pressable
        onPress={() => toggleIngredient(item)}
        style={[styles.featureContainer, isSelected && styles.selectedContainer]}
      >
        {item.ingredient_image && <Image source={{ uri: item.ingredient_image }} style={styles.image} />}
        <View style={styles.textContainer}>
          <Text style={styles.menuName}>{item.ingredient_name}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <SearchBar searchTerm={searchTerm} handleSearch={handleSearch} />
      <CategoryPicker
        selectedCategory={selectedCategory}
        handleCategoryChange={handleCategoryChange}
        categories={categories}
      />
      <IngredientList
        data={filteredItems}
        renderItem={renderItem}
        isLoading={isLoading}
        fetchIngredients={fetchIngredients}
      />
      <View style={styles.buttonContainer}>
        <Button title="Confirm" onPress={handleConfirm} />
        <Button title="Cancel" onPress={handleCancel} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  featureContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: '#007BFF',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  textContainer: {
    padding: 10,
  },
  menuName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
