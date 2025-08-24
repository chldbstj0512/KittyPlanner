import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { loadSampleData } from '../utils/SampleData';

export default function DevHelper() {
  const handleLoadSampleData = async () => {
    Alert.alert(
      'Load Sample Data',
      'This will add sample transactions to the database. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load',
          onPress: async () => {
            const success = await loadSampleData();
            if (success) {
              Alert.alert('Success', 'Sample data loaded successfully!');
            } else {
              Alert.alert('Error', 'Failed to load sample data');
            }
          }
        }
      ]
    );
  };

  // Only show in development
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Development Helper</Text>
      <TouchableOpacity style={styles.button} onPress={handleLoadSampleData}>
        <Text style={styles.buttonText}>Load Sample Data</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 10,
    zIndex: 1000,
  },
  title: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
