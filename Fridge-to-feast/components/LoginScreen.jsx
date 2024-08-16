import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from 'react-native'
import React from 'react';
import * as WebBrowser from "expo-web-browser";
import { Colors } from '@/constants/Colors';
import { useWarmUpBrowser } from "./../hooks/useWarmUpBrowser";
import { useOAuth } from '@clerk/clerk-expo';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    useWarmUpBrowser();
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
 
    const onPress = React.useCallback(async () => {
      try {
        const { createdSessionId, signIn, signUp, setActive } =
          await startOAuthFlow();
   
        if (createdSessionId) {
          setActive({ session: createdSessionId });
        } else {
          // Use signIn or signUp for next steps such as MFA
        }
      } catch (err) {
        console.error("OAuth error", err);
      }
    }, []);

    const renderItem = () => (
      <>
        <View style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: 100,
          marginBottom: 20,
        }}>
          <Image source={require('../assets/images/icon.png')} 
            style={{
              width: 220,
              height: 450,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: '#000'
            }} />
        </View>
        <View style={styles.subContainer}>
          <Text style={{
            fontSize: 30,
            fontFamily: 'outfit-bold',
            textAlign: 'center',
          }}>Sign in with
            <Text style={{
              color:Colors.PRIMARY
             }}> Community Food </Text>App</Text>
          <Text style={{
            textAlign: 'center',
            marginVertical: 15,
            fontFamily: 'outfit',
            fontSize: 15,
            color: Colors.GRAY
          }}>Sign in to access your personalized recipe book</Text>
          <TouchableOpacity style={styles.btn}
          onPress={onPress}
          >
            <Text style={{
              color: '#fff',
              textAlign: 'center',
              fontFamily: 'outfit-bold',
              fontSize: 20,
            }}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </>
    );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[{}]} // We only need one item since our content is static
        renderItem={renderItem}
        keyExtractor={() => "key"}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  subContainer:{
    backgroundColor: '#fff',
    padding: 20,
    marginTop: -20,
  },
  btn:{
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 99,
    marginTop: 10,
  }
})