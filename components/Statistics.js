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
import { useTranslation } from 'react-i18next';
import { DatabaseService } from '../services/DatabaseService';
import { CATEGORIES, getCategoryName, getCategoryColor } from '../constants/Categories';
import AdBanner from './AdBanner';

const { width } = Dimensions.get('window');

export default function Statistics({ navigation }) {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    categories: []
  });
  const [previousMonthData, setPreviousMonthData] = useState({
    totalIncome: 0,
    totalExpenses: 0
  });
  const [chartData, setChartData] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState([]);
  const [currentView, setCurrentView] = useState('overview'); // 'overview' or 'categories'
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  useEffect(() => {
    loadMonthlyStatistics();
  }, [selectedMonth]);

  const loadMonthlyStatistics = async () => {
    try {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth() + 1;
      
      // Get current month data
      const summary = await DatabaseService.getMonthlySummary(year, month);
      
      // Get previous month data for comparison
      const prevDate = new Date(selectedMonth);
      prevDate.setMonth(prevDate.getMonth() - 1);
      const prevYear = prevDate.getFullYear();
      const prevMonth = prevDate.getMonth() + 1;
      const prevSummary = await DatabaseService.getMonthlySummary(prevYear, prevMonth);
      
      // Ensure we have valid data
      const validSummary = summary || { totalIncome: 0, totalExpenses: 0, categories: [] };
      const validCategories = validSummary.categories || [];
      const validPrevSummary = prevSummary || { totalIncome: 0, totalExpenses: 0 };
      
      setMonthlyData({
        totalIncome: validSummary.totalIncome || 0,
        totalExpenses: validSummary.totalExpenses || 0,
        categories: validCategories
      });

      setPreviousMonthData({
        totalIncome: validPrevSummary.totalIncome || 0,
        totalExpenses: validPrevSummary.totalExpenses || 0
      });

      // Prepare overview chart data (Income vs Expense vs Balance)
      const safeIncome = Number(validSummary.totalIncome) || 0;
      const safeExpenses = Number(validSummary.totalExpenses) || 0;
      const balance = safeIncome - safeExpenses;
      
      const overviewData = [];
      
      if (safeIncome > 0) {
        overviewData.push({
          name: t('dashboard.income'),
          amount: safeIncome,
          color: '#1E90FF',
          legendFontColor: '#433B2D',
          legendFontSize: 12,
        });
      }
      
      if (safeExpenses > 0) {
        overviewData.push({
          name: t('dashboard.expense'),
          amount: safeExpenses,
          color: '#EF4444',
          legendFontColor: '#433B2D',
          legendFontSize: 12,
        });
      }

      // Only add balance if it's positive
      if (balance > 0) {
        overviewData.push({
          name: t('dashboard.balance'),
          amount: balance,
          color: '#22C55E',
          legendFontColor: '#433B2D',
          legendFontSize: 12,
        });
      }

      setChartData(overviewData);

      // Prepare category chart data
      const categoryData = validCategories
        .filter(category => category && (Number(category.categoryTotal) || 0) > 0)
        .map((category, index) => ({
          name: getCategoryName(category.category || 'miscellaneous'),
          amount: Number(category.categoryTotal) || 0,
          color: getCategoryColor(category.category || 'miscellaneous'),
          legendFontColor: '#433B2D',
          legendFontSize: 12,
        }));

      setCategoryChartData(categoryData);
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Set default values on error
      setMonthlyData({
        totalIncome: 0,
        totalExpenses: 0,
        categories: []
      });
      setPreviousMonthData({
        totalIncome: 0,
        totalExpenses: 0
      });
      setChartData([]);
      setCategoryChartData([]);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₩0';
    }
    return `₩${Number(amount).toLocaleString()}`;
  };

  const formatPercentage = (amount, total) => {
    if (total === 0) return '0%';
    return `${((amount / total) * 100).toFixed(1)}%`;
  };

  const calculateMonthComparison = (current, previous) => {
    const safeCurrent = Number(current) || 0;
    const safePrevious = Number(previous) || 0;
    
    if (safePrevious === 0) {
      return safeCurrent > 0 ? { percentage: 100, isIncrease: true, amount: safeCurrent } : { percentage: 0, isIncrease: false, amount: 0 };
    }
    const difference = safeCurrent - safePrevious;
    const percentage = Math.abs((difference / safePrevious) * 100);
    return {
      percentage: percentage.toFixed(1),
      isIncrease: difference > 0,
      amount: Math.abs(difference)
    };
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#433B2D" />
        </TouchableOpacity>
      </View>

      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity 
          style={styles.monthPickerButton}
          onPress={() => setShowMonthPicker(!showMonthPicker)}
        >
          <Text style={styles.currentMonthText}>
            {`${selectedMonth.getFullYear()}년 ${selectedMonth.getMonth() + 1}월`}
          </Text>
          <Ionicons 
            name={showMonthPicker ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#433B2D" 
          />
        </TouchableOpacity>
        
        {showMonthPicker && (
          <View style={styles.monthDropdown}>
            {getMonthOptions().map((option, index) => (
              <TouchableOpacity
                key={option.value.toISOString()}
                style={[
                  styles.monthOption,
                  selectedMonth.getTime() === option.value.getTime() && styles.monthOptionSelected
                ]}
                onPress={() => {
                  setSelectedMonth(option.value);
                  setShowMonthPicker(false);
                }}
              >
                <Text style={[
                  styles.monthOptionText,
                  selectedMonth.getTime() === option.value.getTime() && styles.monthOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Chart View Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, currentView === 'overview' && styles.toggleButtonActive]}
          onPress={() => setCurrentView('overview')}
        >
          <Text style={[styles.toggleText, currentView === 'overview' && styles.toggleTextActive]}>
            수입·지출·잔액
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, currentView === 'categories' && styles.toggleButtonActive]}
          onPress={() => setCurrentView('categories')}
        >
          <Text style={[styles.toggleText, currentView === 'categories' && styles.toggleTextActive]}>
            카테고리별 지출
          </Text>
        </TouchableOpacity>
      </View>

      {/* Month Comparison */}
      {(() => {
        const expenseComparison = calculateMonthComparison(monthlyData.totalExpenses, previousMonthData.totalExpenses);
        return (
          <View style={styles.comparisonContainer}>
            <Text style={styles.comparisonTitle}>전월 대비</Text>
            <View style={styles.comparisonRow}>
              <Ionicons 
                name={expenseComparison.isIncrease ? "trending-up" : "trending-down"} 
                size={20} 
                color={expenseComparison.isIncrease ? "#EF4444" : "#22C55E"} 
              />
              <Text style={[styles.comparisonText, { color: expenseComparison.isIncrease ? "#EF4444" : "#22C55E" }]}>
                {expenseComparison.isIncrease ? '더 많이' : '더 적게'} 소비: {formatCurrency(expenseComparison.amount)} ({expenseComparison.percentage}%)
              </Text>
            </View>
          </View>
        );
      })()}

      {/* Pie Chart */}
      {(currentView === 'overview' ? chartData : categoryChartData).length > 0 ? (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            {currentView === 'overview' ? '수입·지출·잔액 비율' : '카테고리별 지출 분석'}
          </Text>
          <PieChart
            data={currentView === 'overview' ? chartData : categoryChartData}
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
          <Text style={styles.emptyText}>{t('statistics.noData')}</Text>
        </View>
      )}

      {/* Category Details */}
      <View style={styles.categoryDetails}>
        <Text style={styles.categoryTitle}>{t('statistics.categoryDetails')}</Text>
        {monthlyData.categories
          .filter(category => category && (Number(category.categoryTotal) || 0) > 0)
          .map((category, index) => {
            const categoryTotal = Number(category.categoryTotal) || 0;
            const totalExpenses = Number(monthlyData.totalExpenses) || 0;
            
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
                      {getCategoryName(category.category || 'miscellaneous')}
                    </Text>
                    <Text style={styles.categoryAmount}>
                      {formatCurrency(categoryTotal)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.categoryPercentage}>
                  {formatPercentage(categoryTotal, totalExpenses)}
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
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },

  monthSelector: {
    paddingHorizontal: 20,
    paddingVertical: 2,
    backgroundColor: 'white',
    marginTop: 0,
  },
  monthPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 0,
    position: 'relative',
  },
  currentMonthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#433B2D',
    marginRight: 8,
  },
  monthDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  monthOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  monthOptionSelected: {
    backgroundColor: '#FFF5C8',
  },
  monthOptionText: {
    fontSize: 16,
    color: '#433B2D',
  },
  monthOptionTextSelected: {
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FFF5C8',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  toggleTextActive: {
    color: '#433B2D',
    fontWeight: '600',
  },
  comparisonContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#433B2D',
    marginBottom: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
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
