import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { Colors } from '../../constants/Colors';

export default function EditProfile() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    country: params.country || '',
    province: params.province || '',
    district: params.district || '',
    sub_district: params.sub_district || '',
    village: params.village || '',
    house_number: params.house_number || '',
    postal_code: params.postal_code || ''
  });

  const handleChange = (name, value) => {
    setUserData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!userData.postal_code || userData.postal_code.length !== 5 || isNaN(userData.postal_code)) {
      Alert.alert('Error', 'Please enter a valid 5-digit postal code.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`http://192.168.1.253:3000/update_user/${params.user_id}`, userData);
      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated successfully');
        router.back();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      ) : (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={userData.country}
              onChangeText={(text) => handleChange('country', text)}
              placeholder="Enter country"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Province</Text>
            <TextInput
              style={styles.input}
              value={userData.province}
              onChangeText={(text) => handleChange('province', text)}
              placeholder="Enter province"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>District</Text>
            <TextInput
              style={styles.input}
              value={userData.district}
              onChangeText={(text) => handleChange('district', text)}
              placeholder="Enter district"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Sub-district</Text>
            <TextInput
              style={styles.input}
              value={userData.sub_district}
              onChangeText={(text) => handleChange('sub_district', text)}
              placeholder="Enter sub-district"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Village</Text>
            <TextInput
              style={styles.input}
              value={userData.village}
              onChangeText={(text) => handleChange('village', text)}
              placeholder="Enter village"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>House Number</Text>
            <TextInput
              style={styles.input}
              value={userData.house_number}
              onChangeText={(text) => handleChange('house_number', text)}
              placeholder="Enter house number"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Postal Code</Text>
            <TextInput
              style={styles.input}
              value={userData.postal_code}
              onChangeText={(text) => handleChange('postal_code', text)}
              placeholder="Enter postal code"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Confirm Changes</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
