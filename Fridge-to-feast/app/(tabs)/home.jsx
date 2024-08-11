import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, Button } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import Recipes from '@/components/Home/Recipes';
import Header from '@/components/Home/Header';
import Category from '@/components/Home/Category';

const HomeScreen = () => {
  const { user } = useUser();
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const handleRefresh = () => {
    setRefreshTrigger(prev => !prev);
  };

  const renderHeader = () => (
    <>
      <Header />
      <View style={styles.contentWrapper}>
        <Category />
        <Button title="Refresh Recipes" onPress={handleRefresh} />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]} // Empty data to prevent FlatList from rendering items (only used for structure)
        ListHeaderComponent={renderHeader}
        renderItem={null} // No items to render
        ListFooterComponent={<Recipes refreshTrigger={refreshTrigger} />} // Pass refreshTrigger to Recipes
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
