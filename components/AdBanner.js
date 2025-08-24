import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdBanner() {
  // Temporarily disabled AdMob to prevent runtime errors
  // TODO: Re-enable when expo-ads-admob is properly configured
  
  return (
    <View style={styles.container}>
      <Text style={styles.adText}>Ad Space</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    height: 60,
    margin: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  adText: {
    fontSize: 14,
    color: '#999',
  },
});
