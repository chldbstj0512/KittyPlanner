import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Animated, Alert, Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as SplashScreen from 'expo-splash-screen';
import { DatabaseService } from './services/DatabaseService';
import { NotificationService } from './services/NotificationService';
import Dashboard from './components/Dashboard';
import TransactionDetails from './components/TransactionDetails';
import Statistics from './components/Statistics';
import ErrorBoundary from './components/ErrorBoundary';
import AppLogo from './components/AppLogo';
import { colors } from './theme/colors';
import './i18n/i18n'; // i18n 초기화

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { t } = useTranslation();

  useEffect(() => {
    // 즉시 기본 스플래시 화면 숨기기
    const hideSplash = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
        // 안드로이드에서 더 확실하게 숨기기
        setTimeout(async () => {
          await SplashScreen.hideAsync();
        }, 100);
      } catch (error) {
        console.log('SplashScreen error:', error);
      }
    };
    
    hideSplash();
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Starting app initialization...');
      
      // Database initialization in background
      DatabaseService.initDatabase().then(() => {
        console.log('Database initialized successfully');
      }).catch((error) => {
        console.error('Error initializing database:', error);
      });

      // Notification initialization
      const hasPermission = await NotificationService.requestPermissions();
      if (hasPermission) {
        await NotificationService.scheduleDailyReminder();
      } else {
        // 권한이 없어도 기본적으로 알림 스케줄링 시도 (사용자가 나중에 권한을 허용할 수 있음)
        await NotificationService.scheduleDailyReminder();
        
        // 최초 설치 시에만 권한 요청 알림 표시 (AsyncStorage로 상태 관리)
        const hasShownPermissionRequest = await AsyncStorage.getItem('hasShownPermissionRequest');
        if (!hasShownPermissionRequest) {
          // 1초 후에 권한 요청 알림 표시
          setTimeout(async () => {
            Alert.alert(
              '알림 권한',
              '매일 오후 10시 알림을 받으시겠습니까?',
              [
                { 
                  text: '나중에', 
                  style: 'cancel',
                  onPress: async () => {
                    // 나중에를 선택해도 표시했음을 저장
                    await AsyncStorage.setItem('hasShownPermissionRequest', 'true');
                  }
                },
                { 
                  text: '권한 설정', 
                  onPress: async () => {
                    // 권한 설정을 선택해도 표시했음을 저장
                    await AsyncStorage.setItem('hasShownPermissionRequest', 'true');
                    if (Platform.OS === 'ios') {
                      Linking.openURL('app-settings:');
                    } else {
                      Linking.openSettings();
                    }
                  }
                }
              ]
            );
          }, 1000);
        }
      }
      
      // Show splash screen for 2 seconds, then fade out
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          setShowSplash(false);
          setIsLoading(false);
        });
      }, 2000);
    } catch (error) {
      console.error('Error initializing app:', error);
      setShowSplash(false);
      setIsLoading(false);
    }
  };



  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar backgroundColor="#FFF5C8" barStyle="dark-content" />
        <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
          <AppLogo size={120} />
        </Animated.View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <NavigationContainer>
          <StatusBar style="auto" />
          
          <Stack.Navigator>
            <Stack.Screen 
              name="Dashboard" 
              component={Dashboard}
              options={{ 
                headerShown: false
              }}
            />
            <Stack.Screen 
              name="TransactionDetails" 
              component={TransactionDetailsScreen}
              options={{ 
                headerShown: false,
                presentation: 'modal'
              }}
            />
            <Stack.Screen 
              name="Statistics" 
              component={Statistics}
              options={{ 
                headerShown: false
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}




const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5C8',
  },
});

function TransactionDetailsScreen({ route, navigation }) {
  const { date } = route.params;
  
  return (
    <TransactionDetails
      selectedDate={date}
      onClose={() => navigation.goBack()}
    />
  );
}




