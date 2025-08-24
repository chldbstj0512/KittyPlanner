import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DatabaseService } from './services/DatabaseService';
import Dashboard from './components/Dashboard';
import TransactionDetails from './components/TransactionDetails';
import ErrorBoundary from './components/ErrorBoundary';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await DatabaseService.initDatabase();
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing app:', error);
      // Even if database initialization fails, we should still show the app
      // The user can retry or use the app without database functionality
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="paw" size={64} color="#4CAF50" />
        <Text style={styles.loadingText}>KittyPlanner</Text>
        <Text style={styles.loadingSubtext}>Loading...</Text>
      </View>
    );
  }

  return (
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
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },

});
