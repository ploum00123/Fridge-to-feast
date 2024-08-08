import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import * as WebBrowser from "expo-web-browser";
import { Colors } from '@/constants/Colors';
import { useWarmUpBrowser } from "./../hooks/useWarmUpBrowser";
import { useOAuth, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';

WebBrowser.maybeCompleteAuthSession();

const tokenCache = {
  getToken(key) {
    return SecureStore.getItemAsync(key).catch(err => {
      console.error('Error getting token:', err);
      return null;
    });
  },
  saveToken(key, value) {
    return SecureStore.setItemAsync(key, value).catch(err => {
      console.error('Error saving token:', err);
      return null;
    });
  },
};

export default function LoginScreen() {
    useWarmUpBrowser();
    const navigation = useNavigation();

    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google", redirectUri: "https://splendid-llama-90.clerk.accounts.dev/v1/oauth_callback" });
    const { isLoaded, userId, sessionId, getToken } = useAuth();

    const saveUserId = async (userId) => {
      await tokenCache.saveToken('userId', userId);
    };

    const onPress = React.useCallback(async () => {
        try {
            const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow();

            if (createdSessionId) {
                setActive({ session: createdSessionId });
            } else {
                // Use signIn or signUp for next steps such as WAF
            }
        } catch (err) {
            console.error("OAuth error", err);
        }
    }, []);

    useEffect(() => {
        if (isLoaded && userId) {
          console.log("User ID:", userId); // ตรวจสอบค่า userId
          saveUserId(userId); // เก็บ userId ใน SecureStore
          getToken({ template: "BackendAPI" })
            .then(token => {
              console.log("Token:", token); // ตรวจสอบค่า token
              // ส่ง userId และ token ไปยัง backend ของคุณผ่าน API request
              fetch('http://localhost:3000/api/save-user', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId }) // ส่ง userId
              })
              .then(response => response.json())
              .then(data => {
                console.log('User ID saved:', data);
                navigation.navigate('Home'); // นำทางไปที่หน้า Home
              })
              .catch(error => {
                console.error('Error saving user ID:', error);
              });
            })
            .catch(err => {
              console.error("Error getting token:", err);
            });
        }
      }, [isLoaded, userId]);

    return (
        <View>
            <View style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: 100
            }}>
                <Image source={require('./../assets/images/icon.png')}
                    style={{
                        width: 220,
                        height: 450,
                        borderRadius: 20,
                        borderWidth: 2,
                        borderColor: '#000',
                    }}
                />
            </View>

            <View style={styles.subContainer}>
                <Text style={{
                    fontSize: 34,
                    fontFamily: 'outfit-bold',
                    textAlign: 'center',
                }}>Your Food
                    <Text style={{
                        color: Colors.PRIMARY,
                    }}> Community food management </Text>App
                </Text>
                <Text style={{
                    fontSize: 15,
                    fontFamily: 'outfit',
                    textAlign: 'center',
                    marginVertical: 15,
                    color: Colors.GRAY,
                }}>Find your favorite food</Text>
                <TouchableOpacity style={styles.btn}
                    onPress={onPress}
                >
                    <Text style={{
                        textAlign: 'center',
                        color: '#fff',
                        fontFamily: 'outfit'
                    }}>Let's Get Started</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    subContainer: {
        backgroundColor: '#fff',
        padding: 20,
        marginTop: -20,
    },
    btn: {
        backgroundColor: Colors.PRIMARY,
        padding: 16,
        borderRadius: 99,
        marginTop: 20,
    }
});
