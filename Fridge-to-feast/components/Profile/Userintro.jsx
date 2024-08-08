import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { Colors } from '../../constants/Colors';

export default function Userintro() {
    const {user}=useUser();
    const {signOut}=useAuth();
  return (
    <View>
      <Image source={{uri:user?.imageUrl}}
        style={styles.image}
      />
      <TouchableOpacity style={styles.btn}
      onPress={() => signOut()}>
        <Text style={styles.text}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'outfit-bold',
    fontSize: 20,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  btn:{
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 99,
    marginTop: 10,
  }
})