import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Text } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import Recipes from '@/components/Home/Recipes';
import Header from '@/components/Home/Header';
import Category from '@/components/Home/Category';
import { Colors } from '@/constants/Colors';

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
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Refresh Recipes</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]}
        ListHeaderComponent={renderHeader}
        renderItem={null}
        ListFooterComponent={<Recipes refreshTrigger={refreshTrigger} />}
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
  refreshButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});