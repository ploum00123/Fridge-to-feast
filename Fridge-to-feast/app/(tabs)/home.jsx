import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';

const HomeScreen = () => {
  const { user } = useUser();

  useEffect(() => {
    const sendUserIdToServer = async () => {
      if (user) {
        try {
          await axios.post('http://192.168.1.253:3000/saveUserId', {
            userId: user.id,
          });
          console.log('User ID sent to server');
        } catch (error) {
          console.error('Error sending User ID to server:', error);
        }
      }
    };

    sendUserIdToServer();
  }, [user]);

  return (
    <View>
      <Text>Welcome to the Home Screen</Text>
      {user ? <Text>User ID: {user.id}</Text> : <Text>Loading...</Text>}
    </View>
  );
};

export default HomeScreen;
