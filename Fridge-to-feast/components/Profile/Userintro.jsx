import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Colors } from '../../constants/Colors';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function Userintro({ refresh }) {
    const { user } = useUser();
    const router = useRouter();
    const [userData, setUserData] = useState({
        country: '',
        province: '',
        district: '',
        sub_district: '',
        village: '',
        house_number: '',
        postal_code: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user, refresh]); // Add refresh as a dependency

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://fridge-to-feast-new-e0bee58d224d.herokuapp.com/user_data/${user.id}`);
            if (response.data) {
                setUserData(prevState => ({
                    ...prevState,
                    ...response.data
                }));
            } else {
                await createNewUserRecord();
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            if (error.response && error.response.status === 404) {
                await createNewUserRecord();
            } else {
                Alert.alert('Error', 'Failed to fetch user data. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const createNewUserRecord = async () => {
        try {
            await axios.post('https://fridge-to-feast-new-e0bee58d224d.herokuapp.com/create_user', { user_id: user.id });
            Alert.alert('New User', 'A new profile has been created for you. Please edit your details.');
        } catch (error) {
            console.error('Error creating new user record:', error);
            Alert.alert('Error', 'Failed to create new user record. Please try again later.');
        }
    };
    
    const handleEditProfile = () => {
        router.push({
            pathname: '/editprofile/[edit]',
            params: {
                ...userData,
                fullName: user?.fullName,
                email: user?.primaryEmailAddress?.emailAddress,
                imageUrl: user?.imageUrl
            }
        });
    };

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: user?.imageUrl }} style={styles.image} />
            <Text style={styles.name}>{user?.fullName}</Text>
            <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>

            <View style={styles.dataContainer}>
                <Text style={styles.dataTitle}>Address Information:</Text>
                <View style={styles.addressFrame}>
                    <Text style={styles.dataText}>Country: {userData.country || 'Not specified'}</Text>
                    <Text style={styles.dataText}>Province: {userData.province || 'Not specified'}</Text>
                    <Text style={styles.dataText}>District: {userData.district || 'Not specified'}</Text>
                    <Text style={styles.dataText}>Sub-district: {userData.sub_district || 'Not specified'}</Text>
                    <Text style={styles.dataText}>Village: {userData.village || 'Not specified'}</Text>
                    <Text style={styles.dataText}>House Number: {userData.house_number || 'Not specified'}</Text>
                    <Text style={styles.dataText}>Postal Code: {userData.postal_code || 'Not specified'}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile}>
                <Text style={styles.btnText}>Edit Profile</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    dataContainer: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    dataTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    addressFrame: {
        borderWidth: 1,
        borderColor: Colors.PRIMARY,
        borderRadius: 5,
        padding: 10,
    },
    dataText: {
        fontSize: 16,
        marginBottom: 5,
    },
    editBtn: {
        backgroundColor: Colors.PRIMARY,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    btnText: {
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'outfit-bold',
        fontSize: 18,
    },
});
