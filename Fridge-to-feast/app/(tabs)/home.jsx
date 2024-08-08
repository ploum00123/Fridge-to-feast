import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const tokenCache = {
  getToken(key) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      console.error('Error getting token:', err);
      return null;
    }
  },
};

const HomeScreen = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await tokenCache.getToken('userId');
      if (id) {
        setUserId(id);
        console.log('Retrieved User ID:', id);
      } else {
        console.log('No User ID found');
      }
    };

    fetchUserId();
  }, []);

  return (
    <View>
      <Text>Welcome to the Home Screen</Text>
      {userId && <Text>User ID: {userId}</Text>}
    </View>
  );
};

export default HomeScreen;
