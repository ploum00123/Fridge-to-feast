import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import { useUser } from '@clerk/clerk-expo';
import { Colors } from '@/constants/Colors';

export default function CookMethod() {
    const [cookMethods, setCookMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [sliderValue, setSliderValue] = useState(0);
    const { user } = useUser();

    useEffect(() => {
        fetchCookMethods();
    }, []);

    const fetchCookMethods = async () => {
        try {
            const response = await axios.get('http://192.168.1.253:3000/cook_methods');
            setCookMethods(response.data);
        } catch (error) {
            console.error('Error fetching cook methods:', error);
        }
    };

    const handleMethodSelect = (method) => {
        setSelectedMethod(method);
        setSliderValue(0); // Reset slider value when a new method is selected
    };

    const handleSliderChange = (value) => {
        setSliderValue(value);
    };

    const handleConfirm = async () => {
        if (selectedMethod && sliderValue > 0) {
            try {
                await axios.post('http://192.168.1.253:3000/add_user_cookmethod', {
                    user_id: user.id,
                    cooking_method_id: selectedMethod.cooking_method_id,
                    preference_level: sliderValue
                });
                alert('Cooking method preference saved!');
                setSelectedMethod(null);
                setSliderValue(0);
            } catch (error) {
                console.error('Error saving cook method preference:', error);
                alert('Failed to save preference. Please try again.');
            }
        } else {
            alert('Please select a cooking method and set your preference level.');
        }
    };

    const renderCookMethodItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.methodItem,
                selectedMethod?.cooking_method_id === item.cooking_method_id && styles.selectedMethodItem
            ]}
            onPress={() => handleMethodSelect(item)}
        >
            <Text style={styles.methodText}>{item.cooking_method_name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cooking Methods</Text>
            <FlatList
                data={cookMethods}
                renderItem={renderCookMethodItem}
                keyExtractor={(item) => item.cooking_method_id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.methodList}
            />
            {selectedMethod && (
                <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabel}>Set your preference for {selectedMethod.cooking_method_name}:</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={10}
                        step={1}
                        value={sliderValue}
                        onValueChange={handleSliderChange}
                        minimumTrackTintColor={Colors.PRIMARY}
                        maximumTrackTintColor="#000000"
                    />
                    <Text style={styles.sliderValue}>{sliderValue}</Text>
                    <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                        <Text style={styles.confirmButtonText}>Confirm Preference</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontFamily: 'outfit-bold',
        fontSize: 20,
        marginBottom: 10,
    },
    methodList: {
        marginBottom: 20,
    },
    methodItem: {
        padding: 10,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    selectedMethodItem: {
        backgroundColor: Colors.PRIMARY,
    },
    methodText: {
        fontFamily: 'outfit-medium',
        fontSize: 20,
    },
    sliderContainer: {
        alignItems: 'center',
    },
    sliderLabel: {
        fontFamily: 'outfit-medium',
        marginBottom: 10,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderValue: {
        fontFamily: 'outfit-bold',
        fontSize: 18,
        marginTop: 10,
    },
    confirmButton: {
        backgroundColor: Colors.PRIMARY,
        padding: 10,
        borderRadius: 20,
        marginTop: 20,
    },
    confirmButtonText: {
        color: 'white',
        fontFamily: 'outfit-bold',
        textAlign: 'center',
    },
});