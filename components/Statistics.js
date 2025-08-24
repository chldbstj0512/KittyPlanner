import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { DatabaseService } from '../services/DatabaseService';
import { CATEGORIES, getCategoryName, getCategoryColor } from '../constants/Categories';
import AdBanner from './AdBanner';

const { width } = Dimensions.get('window');

export default function Statistics() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    categories: []
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadMonthlyStatistics();
  }, [selectedMonth]);

  const loadMonthlyStatistics = async () => {
    try {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth() + 1;
      
      const summary = await DatabaseService.getMonthlySummary(year, month);
      
      // Ensure we have valid data
      const validSummary = summary || { totalIncome: 0, totalExpenses: 0, categories: [] };
      const validCategories = validSummary.categories || [];
      
      setMonthlyData({
        totalIncome: validSummary.totalIncome || 0,
        totalExpenses: validSummary.totalExpenses || 0,
        categories: validCategories
      });

      // Prepare chart data
      const chartData = validCategories.map((category, index) => ({
        name: getCategoryName(category.category || 'miscellaneous', 'ko'),
        amount: category.categoryTotal || 0,
        color: getCategoryColor(category.category || 'miscellaneous'),
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      }));

      setChartData(chartData);
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Set default values on error
      setMonthlyData({
        totalIncome: 0,
        totalExpenses: 0,
        categories: []
      });
      setChartData([]);
    }
  };

  const formatCurrency = (amount) => {
    return `₩${amount.toLocaleString()}`;
  };

  const formatPercentage = (amount, total) => {
    if (total === 0) return '0%';
    return `${((amount / total) * 100).toFixed(1)}%`;
  };

  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      options.push({
        label: `${date.getFullYear()}년 ${date.getMonth() + 1}월`,
        value: date
      });
    }
    
    return options;
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistics</Text>
        <Text style={styles.headerSubtitle}>지출 분석</Text>
      </View>

      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <Text style={styles.monthLabel}>Select Month</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            style={styles.picker}
          >
            {getMonthOptions().map((option) => (
              <Picker.Item
                key={option.value.toISOString()}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: '#E8F5E8' }]}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={[styles.summaryAmount, { color: '#4CAF50' }]}>
            {formatCurrency(monthlyData.totalIncome)}
          </Text>
        </View>
        
        <View style={[styles.summaryCard, { backgroundColor: '#FFEBEE' }]}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={[styles.summaryAmount, { color: '#F44336' }]}>
            {formatCurrency(monthlyData.totalExpenses)}
          </Text>
        </View>
      </View>

      {/* Pie Chart */}
      {chartData.length > 0 ? (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Expense Breakdown</Text>
          <PieChart
            data={chartData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      ) : (
        <View style={styles.emptyChart}>
          <Ionicons name="pie-chart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No data for this month</Text>
        </View>
      )}

      {/* Category Details */}
      <View style={styles.categoryDetails}>
        <Text style={styles.categoryTitle}>Category Details</Text>
        {monthlyData.categories.map((category, index) => {
          if (!category) return null;
          
          return (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(category.category || 'miscellaneous') }]}>
                  <Ionicons 
                    name={CATEGORIES[(category.category || 'miscellaneous').toUpperCase()]?.icon || 'paw'} 
                    size={16} 
                    color="white" 
                  />
                </View>
                <View style={styles.categoryText}>
                  <Text style={styles.categoryName}>
                    {getCategoryName(category.category || 'miscellaneous', 'ko')}
                  </Text>
                  <Text style={styles.categoryAmount}>
                    {formatCurrency(category.categoryTotal || 0)}
                  </Text>
                </View>
              </View>
              <Text style={styles.categoryPercentage}>
                {formatPercentage(category.categoryTotal || 0, monthlyData.totalExpenses)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Ad Banner */}
      <AdBanner />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  monthSelector: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyChart: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  categoryDetails: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryAmount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  categoryPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  adBanner: {
    backgroundColor: '#f0f0f0',
    height: 60,
    margin: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  adText: {
    fontSize: 14,
    color: '#999',
  },
});
