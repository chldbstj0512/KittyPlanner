import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
// import { AdMobBanner } from 'expo-ads-admob'; // Expo Go에서는 비활성화

export default function AdBanner() {
  const [adError, setAdError] = useState(false);

  // 테스트 광고 ID (실제 배포 시에는 AdMob에서 발급받은 실제 ID로 교체)
  const bannerTestID = 'ca-app-pub-3940256099942544/6300978111'; // Android
  const bannerProductionID = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'; // 실제 ID로 교체 필요

  const handleAdError = (error) => {
    console.log('Ad error:', error);
    setAdError(true);
  };

  // Expo Go에서는 더미 광고 표시, 실제 빌드에서는 AdMob 사용
  const isExpoGo = __DEV__ && !global.__EXPO_DEVTOOLS_GLOBAL_HOOK__;

  if (adError || isExpoGo) {
    return (
      <View style={styles.container}>
        <Text style={styles.adText}>Ad Space</Text>
      </View>
    );
  }

  // 실제 빌드에서만 AdMob 사용
  return (
    <View style={styles.container}>
      <Text style={styles.adText}>Ad Space (Production Build Only)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    margin: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  adText: {
    fontSize: 14,
    color: '#999',
    padding: 20,
  },
});
