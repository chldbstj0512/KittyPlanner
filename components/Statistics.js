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

const { width } = Dimensions.get('window');

export default function Statistics({ navigation, route }) {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState(route.params?.selectedMonth || new Date());
  const [monthlyData, setMonthlyData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    categories: []
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
      
      // Ensure we have valid data
      const validSummary = summary || { totalIncome: 0, totalExpenses: 0, categories: [] };
      const validCategories = validSummary.categories || [];
      
      setMonthlyData({
        totalIncome: validSummary.totalIncome || 0,
        totalExpenses: validSummary.totalExpenses || 0,
        categories: validCategories
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
      console.log('Statistics - validCategories:', validCategories);
      console.log('Statistics - validSummary:', validSummary);
      
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

      console.log('Statistics - categoryData:', categoryData);
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
    console.log('CustomPieChart - data:', data);
    console.log('CustomPieChart - data.length:', data?.length);
    if (!data || data.length === 0) {
      console.log('CustomPieChart - returning null due to empty data');
      return null;
    }

    const radius = size / 2 - 10;
    const center = size / 2;
    let currentAngle = -90; // Start from top

    const total = data.reduce((sum, item) => sum + item.amount, 0);
    console.log('CustomPieChart - total:', total);
    
    const elements = [];
    let angleTracker = -90;
    
    data.forEach((item, index) => {
      const percentage = (item.amount / total) * 100;
      // 단일 카테고리일 때는 전체 원(360도)을 그리도록 수정
      const angle = data.length === 1 ? 360 : (item.amount / total) * 360;
      console.log(`CustomPieChart - item ${index}:`, item.name, 'amount:', item.amount, 'percentage:', percentage, 'angle:', angle, 'data.length:', data.length);
      
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

      // 360도 원의 경우 특별한 처리
      let pathData;
      if (angle >= 360) {
        // 완전한 원을 그리기 위해 두 개의 반원으로 나누어 그리기
        const midAngleRad = (startAngle + 180) * Math.PI / 180;
        const midX = centerX + radius * Math.cos(midAngleRad);
        const midY = centerY + radius * Math.sin(midAngleRad);
        
        pathData = [
          `M ${centerX} ${centerY}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 1 1 ${midX} ${midY}`,
          `A ${radius} ${radius} 0 1 1 ${x1} ${y1}`,
          `Z`
        ].join(' ');
      } else {
        const largeArcFlag = angle > 180 ? 1 : 0;
        pathData = [
          `M ${centerX} ${centerY}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `Z`
        ].join(' ');
      }

      // 라벨 위치 계산 (원 위에, 40px 오프셋 고려)
      const labelRadius = radius * 0.73; // 도넛 두께 중앙에 배치
      const midAngleRad = (midAngle * Math.PI) / 180;
      const labelX = center + labelRadius * Math.cos(midAngleRad) + 40;
      const labelY = center + labelRadius * Math.sin(midAngleRad) + 40;

      // Path 추가
      console.log(`CustomPieChart - pathData for ${item.name}:`, pathData);
      elements.push(
        <Path
          key={`path-${index}`}
          d={pathData}
          fill={item.color}
          stroke="white"
          strokeWidth="2"
        />
      );

      // 라벨 정보 저장 (5% 이상이거나 단일 카테고리인 경우)
      if (percentage >= 5 || data.length === 1) {
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
            if (item.labelX && item.labelY && (item.percentage >= 5 || data.length === 1)) {
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
          

        </View>

        {(() => {
          console.log('Statistics render - categoryChartData:', categoryChartData);
          console.log('Statistics render - categoryChartData.length:', categoryChartData.length);
          return categoryChartData.length > 0 ? (
          <>
            {/* Pie Chart */}
            <View style={styles.chartSection}>
              <CustomPieChart 
                data={categoryChartData}
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
                            name="star" 
                            size={16} 
                            color="white" 
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
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>지출이 없습니다</Text>
          </View>
        );
        })()}
      
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
  noDataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
