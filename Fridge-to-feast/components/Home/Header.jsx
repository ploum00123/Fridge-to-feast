import { View, Text, StyleSheet, TextInput } from 'react-native';
import React from 'react';
import { Colors } from '@/constants/Colors';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function Header() {
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
        <Text style={styles.headerText}>Fridge to Feast</Text>
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
        <TextInput placeholder="Search" />
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
