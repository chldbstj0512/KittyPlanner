import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { DatabaseService } from './services/DatabaseService';
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
  const { t } = useTranslation();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Starting app initialization...');
      
      // Add timeout to prevent infinite loading
      const initPromise = DatabaseService.initDatabase();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database initialization timeout')), 5000)
      );
      
      await Promise.race([initPromise, timeoutPromise]);
      console.log('Database initialized successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing app:', error);
      console.log('Proceeding without database...');
      // Even if database initialization fails, we should still show the app
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <AppLogo size={125} />
        </View>
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



function TransactionDetailsScreen({ route, navigation }) {
  const { date } = route.params;
  
  return (
    <TransactionDetails
      selectedDate={date}
      onClose={() => navigation.goBack()}
    />
  );
}



const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5C8',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accent,
    marginTop: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 20,
  },
});
