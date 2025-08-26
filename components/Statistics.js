import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { DatabaseService } from '../services/DatabaseService';
import { CATEGORIES, getCategoryName, getCategoryColor } from '../constants/Categories';
import AdBanner from './AdBanner';
import AppLogo from './AppLogo';

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

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null); // null = overview, 'income' or 'expense' = drilldown

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

      // Prepare overview chart data (Income vs Expense only)
      const safeIncome = Number(validSummary.totalIncome) || 0;
      const safeExpenses = Number(validSummary.totalExpenses) || 0;
      
      const overviewData = [];
      
      if (safeIncome > 0) {
        overviewData.push({
          name: t('dashboard.income'),
          amount: safeIncome,
          color: '#A8D8EA', // 연한 하늘색
          legendFontColor: '#433B2D',
          legendFontSize: 12,
          type: 'income'
        });
      }
      
      if (safeExpenses > 0) {
        overviewData.push({
          name: t('dashboard.expense'),
          amount: safeExpenses,
          color: '#FFB6C1', // 연한 분홍색
          legendFontColor: '#433B2D',
          legendFontSize: 12,
          type: 'expense'
        });
      }

      setChartData(overviewData);

      // Prepare category chart data with colors from Categories.js
      const categoryData = validCategories
        .filter(category => category && (Number(category.categoryTotal) || 0) > 0)
        .sort((a, b) => (Number(b.categoryTotal) || 0) - (Number(a.categoryTotal) || 0)) // 금액순 정렬
        .map((category, index) => ({
          name: getCategoryName(category.category || 'miscellaneous'),
          amount: Number(category.categoryTotal) || 0,
          color: getCategoryColor(category.category || 'miscellaneous'),
          legendFontColor: '#433B2D',
          legendFontSize: 12,
          category: category.category
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
      return '0원';
    }
    return `${Number(amount).toLocaleString()}원`;
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

  const handleChartPress = (data, index) => {
    console.log('Chart pressed:', data, index);
    const chartData = getCurrentChartData();
    const clickedData = chartData[index];
    
    if (clickedData && clickedData.type === 'expense') {
      setSelectedSegment('expense');
    }
    // 수입은 클릭해도 아무 반응하지 않음
  };

  const getCurrentChartData = () => {
    if (selectedSegment === 'expense') {
      return categoryChartData;
    }
    return chartData;
  };

  const getCurrentChartTitle = () => {
    if (selectedSegment === 'expense') {
      return '지출 카테고리별 분석';
    }
    return '수입 vs 지출';
  };

  // Custom Pie Chart Component
  const CustomPieChart = ({ data, size = 200 }) => {
    if (!data || data.length === 0) return null;

    const radius = size / 2 - 10;
    const center = size / 2;
    let currentAngle = -90; // Start from top

    const total = data.reduce((sum, item) => sum + item.amount, 0);
    
    const elements = [];
    let angleTracker = -90;
    
    data.forEach((item, index) => {
      const percentage = (item.amount / total) * 100;
      const angle = (item.amount / total) * 360;
      
      const startAngle = angleTracker;
      const endAngle = angleTracker + angle;
      const midAngle = startAngle + angle / 2; // 중간 각도
      angleTracker = endAngle;

      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      // 40px 오프셋을 적용한 좌표
      const centerX = center + 40;
      const centerY = center + 40;
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`
      ].join(' ');

      // 라벨 위치 계산 (원 위에, 40px 오프셋 고려)
      const labelRadius = radius * 0.73; // 도넛 두께 중앙에 배치
      const midAngleRad = (midAngle * Math.PI) / 180;
      const labelX = center + labelRadius * Math.cos(midAngleRad) + 40;
      const labelY = center + labelRadius * Math.sin(midAngleRad) + 40;

      // Path 추가
      elements.push(
        <Path
          key={`path-${index}`}
          d={pathData}
          fill={item.color}
          stroke="white"
          strokeWidth="2"
        />
      );

      // 라벨 정보 저장 (5% 이상인 경우에만)
      if (percentage >= 5) {
        item.labelX = labelX;
        item.labelY = labelY;
        item.percentage = percentage.toFixed(0);
      }
    });

    return (
      <View style={styles.customChartContainer}>
        <View style={{ position: 'relative' }}>
          <Svg width={size + 80} height={size + 80}>
            {elements}
            {/* Inner circle for donut effect */}
            <Circle
              cx={center + 40}
              cy={center + 40}
              r={radius * 0.45}
              fill="white"
            />
          </Svg>
          
          {/* 라벨들을 절대 위치로 배치 */}
          {data.map((item, index) => {
            if (item.labelX && item.labelY && item.percentage >= 5) {
              return (
                <Text
                  key={`label-${index}`}
                  style={[
                    styles.chartLabel,
                    {
                      position: 'absolute',
                      left: item.labelX - 35, // 중앙 정렬을 위한 조정 (너비 70px의 절반)
                      top: item.labelY - 10,  // 중앙 정렬을 위한 조정
                    }
                  ]}
                >
                  {`${item.name} ${item.percentage}%`}
                </Text>
              );
            }
            return null;
          })}
        </View>
      </View>
    );
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AppLogo size={24} style={styles.headerLogo} />
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
      </View>

        {/* Total Amount */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>{selectedMonth.getMonth() + 1}월 지출</Text>
          <Text style={styles.totalAmount}>{formatCurrency(monthlyData.totalExpenses)}</Text>
          
          <View style={styles.comparisonInfo}>
            {(() => {
              const expenseComparison = calculateMonthComparison(monthlyData.totalExpenses, previousMonthData.totalExpenses);
              
              if (expenseComparison.amount > 0) {
                const amountText = `${Math.round(expenseComparison.amount / 10000)}만원 ${expenseComparison.isIncrease ? '더' : '덜'}`;
                const amountColor = expenseComparison.isIncrease ? '#FF6B6B' : '#4A90E2'; // 더 쓴 경우 빨강, 덜 쓴 경우 파랑
                
                return (
                  <Text style={styles.comparisonText}>
                    지난달보다 <Text style={[styles.comparisonAmount, { color: amountColor }]}>{amountText}</Text> 쓰는 중
                  </Text>
                );
              } else {
                return (
                  <Text style={styles.comparisonText}>지난달과 비슷한 지출</Text>
                );
              }
            })()}
          </View>
        </View>

        {/* Pie Chart */}
        <View style={styles.chartSection}>
          <CustomPieChart 
            data={categoryChartData.length > 0 ? categoryChartData : [
              { name: '데이터 없음', amount: 1, color: '#E5E7EB' }
            ]}
            size={250}
          />
        </View>

        {/* Category List - Scrollable */}
        <ScrollView style={styles.categoryScrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.categoryList}>
            {categoryChartData.map((item, index) => {
              const categoryTotal = item.amount;
              const totalExpenses = Number(monthlyData.totalExpenses) || 0;
              const percentage = totalExpenses > 0 ? ((categoryTotal / totalExpenses) * 100).toFixed(0) : 0;
              
              return (
                <View key={index} style={styles.categoryRow}>
                  <View style={styles.categoryLeft}>
                    <Text style={styles.categoryPercent}>{percentage}%</Text>
                    <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
                      <Ionicons 
                        name={CATEGORIES[(item.category || 'miscellaneous').toUpperCase()]?.icon || 'restaurant'} 
                        size={16} 
                        color="#735D2F" 
                      />
                    </View>
                    <Text style={styles.categoryName}>
                      {item.name}
                    </Text>
                    <View style={[styles.progressBar, { backgroundColor: item.color, width: `${Math.min(percentage * 3, 100)}%` }]} />
                  </View>
                  <Text style={styles.categoryAmount}>{formatCurrency(categoryTotal)}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      
      {/* AdBanner at the bottom */}
      <AdBanner />
    </View>
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
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 0,
    backgroundColor: 'white',
    position: 'relative',
  },
  headerLogo: {
    position: 'absolute',
    left: 20,
  },
  closeButton: {
    padding: 12,
  },
  content: {
    flex: 1,
  },
  categoryScrollView: {
    flex: 1,
    marginTop: -10,
  },
  totalSection: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 5,
    marginBottom: 0,
    paddingBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  comparisonInfo: {
    alignItems: 'flex-start',
    marginTop: 3,
  },
  comparisonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  comparisonAmount: {
    fontWeight: '600',
  },
  chartSection: {
    backgroundColor: 'white',
    paddingVertical: 0,
    alignItems: 'center',
    marginBottom: 0,
  },
  chartLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  chartLabelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 8,
  },
  chartLabelColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  chartLabelText: {
    fontSize: 12,
    color: '#666',
  },
  customChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  chartLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#433B2D',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    width: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryList: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 4,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  categoryPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    width: 35,
    textAlign: 'right',
    marginRight: 12,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginRight: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 59,
    right: 0,
    top: '50%',
    marginTop: 15,
    opacity: 0.3,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
