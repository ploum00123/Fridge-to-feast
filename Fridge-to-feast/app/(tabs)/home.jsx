import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import Recipes from '@/components/Home/Recipes';
import Header from '@/components/Home/Header';
import Category from '@/components/Home/Category';

const HomeScreen = () => {
  const { user } = useUser();

  useEffect(() => {
      sendUserIdToServer();
  }, []);

  const sendUserIdToServer = async () => {
    try {
      await axios.post('http://192.168.1.253:3000/saveUserId', {
        userId: user.id,
      });
      console.log('User ID sent to server');
    } catch (error) {
      console.error('Error sending User ID to server:', error);
    }
  };

  const renderHeader = () => (
    <>
      <Header />
      <View style={styles.contentWrapper}>
        <Category />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]} // Empty data to prevent FlatList from rendering items (only used for structure)
        ListHeaderComponent={renderHeader}
        renderItem={null} // No items to render
        ListFooterComponent={<Recipes />} // Use Recipes as the footer or another FlatList
        contentContainerStyle={styles.scrollViewContent}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    padding: 16,
  },
});
