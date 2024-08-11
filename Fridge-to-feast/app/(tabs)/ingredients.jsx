import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, ScrollView, TouchableOpacity, } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import Search from '@/components/Ingredients/Search';
import Ingredients from '@/components/Ingredients/IngredientsList';
import IngredientsCategory from '@/components/Ingredients/IngredientCate';
import { useRouter } from 'expo-router';
import CookMethod from '@/components/Ingredients/CookMethod';

const IngredientsScreen = () => {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sendUserIdToServer();
  }, [user]);

  const sendUserIdToServer = async () => {
    if (user) {
      try {
        setLoading(true);
        await axios.post('http://192.168.1.253:3000/saveUserId', {
          userId: user.id,
        });
        console.log('User ID sent to server');
      } catch (error) {
        console.error('Error sending User ID to server:', error);
      }
      finally {
        setLoading(false);
      }
    }
  };

  const navigateToAddIngredient = () => {
    router.push('/addingre/[addingre].js'); // นำทางไปยังหน้าที่ต้องการ
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View>
            <Search />
            <IngredientsCategory />
            <CookMethod />
            <Ingredients />
          </View>
        }
        contentContainerStyle={styles.contentContainer}
        onRefresh={sendUserIdToServer}
        refreshing={loading}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={navigateToAddIngredient}
      >
        <Text style={styles.addButtonText}>Add Ingredient</Text>
      </TouchableOpacity>
    </View>
  );
};

export default IngredientsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 11,
  },
  contentContainer: {
    paddingBottom: 80, // เพิ่ม padding ด้านล่างเพื่อให้ FlatList ไม่ซ้อนทับปุ่ม
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ff6347', // สีแดงมะเขือเทศ
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5, // สำหรับ Android เพื่อให้เงาแสดงผล
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5, // เพิ่มการเว้นระยะระหว่างตัวอักษร
  },
});