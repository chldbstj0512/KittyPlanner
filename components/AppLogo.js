import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const AppLogo = ({ size = 32, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../assets/icon.png')}
        style={[styles.logo, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    borderRadius: 8,
  },
});

export default AppLogo;
