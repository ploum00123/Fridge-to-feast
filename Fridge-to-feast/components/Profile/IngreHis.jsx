import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import { useUser } from '@clerk/clerk-expo';

export default function IngredientHistory({ refresh }) {
  const [history, setHistory] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    fetchIngredientHistory();
  }, [refresh]);

  const fetchIngredientHistory = async () => {
    try {
      const response = await axios.get(`https://fridge-to-feast-new-e0bee58d224d.herokuapp.com/ingredient_history/${user.id}`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching ingredient history:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Image source={{ uri: item.ingredient_image }} style={styles.ingredientImage} />
      <View style={styles.ingredientInfo}>
        <Text style={styles.ingredientName}>{item.ingredient_name}</Text>
        <Text style={styles.addedDate}>{new Date(item.added_date).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ประวัติการเพิ่มวัตถุดิบล่าสุด</Text>
      <View style={styles.historyContainer}>
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.user_refrigerator_id.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>ไม่มีประวัติการเพิ่มวัตถุดิบ</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    maxHeight: 3000, // จำกัดความสูงของ container
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ingredientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addedDate: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});