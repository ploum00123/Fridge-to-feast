import { View, Text, Button, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import Userintro from '../../components/Profile/Userintro';
import SignOut from '@/components/Profile/SignOut';
import IngredientHistory from '@/components/Profile/IngreHis';

export default function Profile() {
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = () => {
    setRefresh(prevState => !prevState);
  };

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'title':
        return <Text style={styles.title}>{item.content}</Text>;
      case 'button':
        return <Button title={item.content} onPress={handleRefresh} />;
      case 'userintro':
        return <Userintro refresh={refresh} />;
      case 'ingredientHistory':
        return <IngredientHistory refresh={refresh} />;
      case 'signout':
        return <SignOut />;
      default:
        return null;
    }
  };

  const data = [
    { id: '1', type: 'title', content: 'Profile' },
    { id: '2', type: 'button', content: 'Refresh Profile' },
    { id: '3', type: 'userintro' },
    { id: '4', type: 'ingredientHistory' },
    { id: '5', type: 'signout' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontFamily: 'outfit-bold',
    fontSize: 35,
    marginBottom: 20,
  },
});