import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { AdMobBanner } from 'expo-ads-admob';

export default function AdBanner() {
  const [adError, setAdError] = useState(false);

  // 테스트 광고 ID (실제 배포 시에는 AdMob에서 발급받은 실제 ID로 교체)
  const bannerTestID = Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
  });
  
  const bannerProductionID = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'; // AdMob에서 발급받은 실제 광고 단위 ID로 교체

  const handleAdError = (error) => {
    console.log('Ad error:', error);
    setAdError(true);
  };

  // 개발 환경에서는 테스트 ID 사용, 프로덕션에서는 실제 ID 사용
  const adUnitID = __DEV__ ? bannerTestID : bannerProductionID;

  // Expo Go에서는 AdMob이 지원되지 않으므로 임시로 비활성화
  const isExpoGo = __DEV__ && !Platform.select({ web: false, default: true });

  if (adError || isExpoGo) {
    return (
      <View style={styles.container}>
        <Text style={styles.adText}>Ad Space</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdMobBanner
        bannerSize="smartBannerPortrait"
        adUnitID={adUnitID}
        onDidFailToReceiveAdWithError={handleAdError}
        servePersonalizedAds={true}
      />
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
