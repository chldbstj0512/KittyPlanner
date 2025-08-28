import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  Animated,
  PanResponder
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { DatabaseService } from '../services/DatabaseService';
import { CATEGORIES, getAllCategories, getCategoryName, getCategoryColor, getCategoryIcon } from '../constants/Categories';
import { suggestCategory } from '../services/CategoryAutoClassifier';
import AdBanner from './AdBanner';
import NotificationSettings from './NotificationSettings';

import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');
const SHOW_AD = true;
const AD_HEIGHT = SHOW_AD ? 72 : 0;
const MIN_TRANSACTION_LIST_HEIGHT = height * 0.25; // 25% of screen height

export default function Dashboard({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    momDelta: 0,
    momPct: null
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    type: 'expense',
    category: 'miscellaneous',
    memo: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [fabVisible, setFabVisible] = useState(true);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimer = useRef(null);
  
  // 스크롤 핸들러
  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    
    // 스크롤 차이가 5px 이상일 때만 반응 (더 민감하게)
    const scrollDiff = currentScrollY - lastScrollY.current;
    
    if (Math.abs(scrollDiff) > 5) {
      if (scrollDiff > 0) {
        // 아래로 스크롤 - FAB 숨기기
        setFabVisible(false);
      } else {
        // 위로 스크롤 - FAB 보이기
        setFabVisible(true);
      }
      lastScrollY.current = currentScrollY;
    }
    
    // 스크롤이 멈춘 후 1초 뒤에 FAB 다시 보이기
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }
    
    scrollTimer.current = setTimeout(() => {
      setFabVisible(true);
    }, 1000);
  };
  
  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, []);

  // Today key (TZ safe)
  const todayKey = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  useEffect(() => {
    loadMonthlyData();
    // 월이 변경될 때마다 selectedDate 초기화하되, 해당 월의 오늘 날짜로 설정
    const today = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // 현재 표시된 월이 실제 오늘과 같은 월이면 오늘 날짜로, 아니면 해당 월의 1일로 설정
    if (today.getFullYear() === currentYear && today.getMonth() === currentMonth) {
      setSelectedDate(today.toISOString().split('T')[0]);
    } else {
      const firstDayOfMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      setSelectedDate(firstDayOfMonth);
    }
  }, [currentDate]);



  // Build sums by date for calendar display
  const sumsByDate = useMemo(() => {
    const map = {};
    for (const t of transactions) {
      const key = t.date;
      if (!map[key]) map[key] = { income: 0, expense: 0 };
      map[key][t.type] += t.amount;
    }
    return map;
  }, [transactions]);

  // Day-only transactions
  const dayTransactions = useMemo(
    () => selectedDate ? transactions.filter(t => t.date === selectedDate) : [],
    [transactions, selectedDate]
  );

  // Helper functions for month-to-date calculations
  const pad2 = (n) => String(n).padStart(2, '0');

  const getMonthTotals = async (y, m) => {
    const rows = await DatabaseService.getTransactionsByMonth(y, m);
    let income = 0, expense = 0;
    rows.forEach(r => {
      if (r.type === 'income') income += r.amount;
      else expense += r.amount;
    });
    return { income, expense, balance: income - expense, rows };
  };

  const getMTDExpense = async (y, m, dayEnd) => {
    const all = await DatabaseService.getTransactionsByMonth(y, m);
    return all
      .filter(r => r.type === 'expense' && Number(r.date.slice(8, 10)) <= dayEnd)
      .reduce((s, r) => s + r.amount, 0);
  };

  const loadMonthlyData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const todayDay = new Date().getDate();
      const mtdEnd = Math.min(
        todayDay,
        new Date(year, month, 0).getDate() // days in current month
      );

      const cur = await getMonthTotals(year, month);
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevMTD = await getMTDExpense(prevYear, prevMonth, mtdEnd);
      const currMTD = await getMTDExpense(year, month, mtdEnd);
      const momDelta = currMTD - prevMTD;
      const momPct = prevMTD === 0 ? null : (momDelta / prevMTD) * 100;

      setTransactions(cur.rows || []);
      setMonthlySummary({
        totalIncome: cur.income || 0,
        totalExpenses: cur.expense || 0,
        balance: cur.balance || 0,
        momDelta,
        momPct
      });
    } catch (error) {
      console.error('Error loading monthly data:', error);
      setTransactions([]);
      setMonthlySummary({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        momDelta: 0,
        momPct: null
      });
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setTransactionForm({
      amount: '',
      type: 'expense',
      category: 'miscellaneous',
      memo: ''
    });
    // 수정 모드 초기화
    setIsEditMode(false);
    setEditingTransactionId(null);
    // selectedDate는 유지 (날짜 선택 상태 보존)
  };

  const saveTransaction = async () => {
    if (saving) return;
    if (!transactionForm.amount || !selectedDate) return;

    // 선택된 날짜가 현재 월과 맞는지 검증
    const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const selectedYearMonth = selectedDate.slice(0, 7);
    
    if (selectedYearMonth !== currentYearMonth) {
      Alert.alert('오류', '선택된 날짜가 현재 월과 맞지 않습니다. 날짜를 다시 선택해주세요.');
      setSelectedDate(null);
      return;
    }

    try {
      setSaving(true);
      // 저장 시점에 자동 분류 다시 실행
      const autoSuggestedCategory = suggestCategory((transactionForm.memo || '').trim());
      
      const payload = {
        date: selectedDate,
        amount: Number(removeCommas(transactionForm.amount)),
        type: transactionForm.type,
        category: autoSuggestedCategory, // 자동 분류 결과 사용
        memo: (transactionForm.memo || '').trim(),
      };
      
      console.log('=== TRANSACTION SAVED ===');
      console.log('Transaction payload:', payload);
      console.log('Auto-suggested category:', autoSuggestedCategory);
      console.log('Final category:', payload.category);
      console.log('========================');
      

      
      // 학습 기능: 사용자가 자동 제안과 다른 카테고리를 선택했을 때
      if (payload.memo && payload.memo.length >= 3) {
        const suggestedCategory = suggestCategory(payload.memo);
        if (suggestedCategory !== payload.category) {
          // 사용자의 선택을 학습 데이터로 저장
          // 실제 앱에서는 이 데이터를 데이터베이스나 AsyncStorage에 저장
          console.log(`Learning: "${payload.memo}" -> "${payload.category}" (suggested: "${suggestedCategory}")`);
          
          // 간단한 학습: 메모의 핵심 단어를 선택된 카테고리에 추가
          const words = payload.memo.toLowerCase().split(/\s+/).filter(word => word.length >= 2);
          if (words.length > 0) {
            // 가장 긴 단어를 선택 (보통 더 의미있는 키워드)
            const longestWord = words.reduce((a, b) => a.length > b.length ? a : b);
            console.log(`Adding learned keyword: "${longestWord}" to category "${payload.category}"`);
          }
        }
      }
      
      if (isEditMode && editingTransactionId) {
        // 수정 모드일 때는 업데이트
        await DatabaseService.updateTransaction(editingTransactionId, payload);
      } else {
        // 새 거래 추가
        await DatabaseService.addTransaction(payload);
      }
      await loadMonthlyData(); // refresh month cache & sums
      closeModal(); // close and reset form (single entry)
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = () => {
    // 수정 모드 초기화 (새 거래 추가 시)
    setIsEditMode(false);
    setEditingTransactionId(null);
    
    // 선택된 날짜가 없으면 기본값 설정 (첫 선택)
    if (!selectedDate) {
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const today = new Date();
      
      let defaultDate;
      if (today.getFullYear() === currentYear && today.getMonth() === currentMonth) {
        // 현재 월이 실제 오늘이고 같은 월이면 오늘 날짜 사용
        defaultDate = today.toISOString().slice(0, 10);
      } else {
        // 다른 월이면 해당 월의 1일로 설정
        defaultDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      }
      
      setSelectedDate(defaultDate);
    }
    // 이미 선택된 날짜가 있으면 그 날짜를 유지 (이전 선택 유지)
    setModalVisible(true);
  };

  const formatCurrency = (amount) => {
    return `₩${amount.toLocaleString()}`;
  };

  const formatCurrencyWithSign = (amount, type) => {
    const sign = type === 'income' ? '+' : '-';
    return `${sign}${amount.toLocaleString()}`;
  };

  // 숫자 입력시 콤마 포맷팅 함수
  const formatNumberWithCommas = (text) => {
    // 숫자가 아닌 문자 제거
    const numericText = text.replace(/[^0-9]/g, '');
    // 콤마 추가
    return numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 콤마 제거하고 순수 숫자만 반환
  const removeCommas = (text) => {
    return text.replace(/,/g, '');
  };

  const getCategoryIcon = (categoryId) => {
    const category = CATEGORIES[categoryId.toUpperCase()];
    return category ? category.icon : 'paw';
  };

  // 월 이동 함수 - 캘린더와 동일한 방식으로 처리
  const navigateMonth = (direction) => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    let newYear = currentYear;
    let newMonth = currentMonth;
    
    if (direction === 'prev') {
      newMonth = currentMonth - 1;
      if (newMonth < 0) {
        newMonth = 11;
        newYear = currentYear - 1;
      }
    } else {
      newMonth = currentMonth + 1;
      if (newMonth > 11) {
        newMonth = 0;
        newYear = currentYear + 1;
      }
    }
    
    // 상태 업데이트를 순차적으로 처리하여 동기화 보장
    const dt = new Date(newYear, newMonth, 1);
    const firstDayOfMonth = `${newYear}-${String(newMonth + 1).padStart(2, '0')}-01`;
    
    setCurrentDate(dt);
    
    // selectedDate는 유지 (월 이동 시에도 선택된 날짜 보존)
    // setTimeout(() => {
    //   setSelectedDate(firstDayOfMonth);
    // }, 0);
  };

  const formatMonthYear = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}년 ${t(`months.${month}`)}`;
  };

  // 항목 기반 자동 카테고리 분류
  const handleMemoChange = (memoText) => {
    console.log('handleMemoChange: Raw input:', memoText);
    console.log('handleMemoChange: Input length:', memoText?.length);
    console.log('handleMemoChange: Input type:', typeof memoText);
    console.log('handleMemoChange: Input char codes:', memoText?.split('').map(c => c.charCodeAt(0)));
    
    setTransactionForm(prev => ({
      ...prev,
      memo: memoText
    }));

    // 지출일 때만 자동 분류 실행 (수입은 제외)
    if (transactionForm.type === 'expense' && memoText && memoText.trim().length >= 1) {
      console.log('handleMemoChange: Auto-categorizing memo:', memoText);
      const suggestedCategory = suggestCategory(memoText);
      console.log('handleMemoChange: Suggested category:', suggestedCategory);
      setTransactionForm(prev => ({
        ...prev,
        category: suggestedCategory
      }));
    }
  };

  // 거래 수정 함수
  const handleEditTransaction = (transaction) => {
    setIsEditMode(true);
    setEditingTransactionId(transaction.id);
    setTransactionForm({
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      memo: transaction.memo || ''
    });
    setSelectedDate(transaction.date);
    setModalVisible(true);
  };

  // 거래 삭제 함수
  const deleteTransaction = async (transactionId) => {
    Alert.alert(
      t('app.delete'),
      '이 항목을 삭제할까요?',
      [
        {
          text: t('app.cancel'),
          style: 'cancel',
        },
        {
          text: t('app.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteTransaction(transactionId);
              await loadMonthlyData();
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert(t('app.error'), '거래 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 각 거래 항목의 애니메이션 상태를 관리하는 ref
  const swipeAnimations = useRef({}).current;

  const getSwipeAnimation = (itemId) => {
    if (!swipeAnimations[itemId]) {
      swipeAnimations[itemId] = new Animated.Value(0);
    }
    return swipeAnimations[itemId];
  };

  const renderTransaction = ({ item }) => {
    const categoryKey = item.category || 'miscellaneous';
    
    // Categories.js에서 표준 아이콘 가져오기
    const categoryIconData = getCategoryIcon(categoryKey);
    const iconName = categoryIconData?.name || 'star';
    const translateX = getSwipeAnimation(item.id);
    
    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0) { // 왼쪽으로 스와이프만
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -100) {
          // 충분히 왼쪽으로 스와이프하면 삭제
          deleteTransaction(item.id);
        }
        // 원래 위치로 복원
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    });
    
    return (
      <View style={styles.txRowContainer}>
        {/* 삭제 버튼 (뒤쪽) */}
        <View style={styles.deleteBackground}>
          <Ionicons name="trash" size={24} color="white" />
        </View>
        
        {/* 거래 내역 (앞쪽) */}
        <Animated.View
          style={[
            styles.txRow,
            {
              transform: [{ translateX }],
            },
          ]}
          {...panResponder.panHandlers}
          onLongPress={() => handleEditTransaction(item)}
        >
          <View style={styles.txIconContainer}>
                                  <View style={[
                        styles.txIcon,
                        { backgroundColor: item.type === 'income' ? 'rgba(76, 175, 80, 0.8)' : getCategoryColor(categoryKey) }
                      ]}>
                        <Ionicons 
                          name={item.type === 'income' ? 'add-circle' : iconName}
                          size={20} 
                          color="white"
                        />
                      </View>
          </View>
          <View style={styles.txContent}>
            <Text style={styles.txCategory}>
              {item.type === 'income' ? '수입' : getCategoryName(item.category || 'miscellaneous')}
            </Text>
            <Text style={styles.txMemo}>{item.memo || ''}</Text>
          </View>
          <View style={styles.txAmountContainer}>
                                  <Text style={[
                        styles.txAmount,
                        { color: item.type === 'income' ? 'rgba(76, 175, 80, 0.9)' : colors.expense }
                      ]}>
                        {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()}원
                      </Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  return (
    <View style={styles.container}>
      {/* Yellow Background for Top Area */}
      <View style={[styles.topBackground, { paddingTop: insets.top + 2 }]}>
        {/* Month Header */}
        <View style={styles.monthHeader}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setShowNotificationSettings(true)}
          >
            <Ionicons name="notifications" size={18} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.monthNavigation}>
            <TouchableOpacity 
              style={styles.monthArrow}
              onPress={() => navigateMonth('prev')}
            >
              <Ionicons name="chevron-back" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.monthText}>{formatMonthYear(currentDate)}</Text>
            <TouchableOpacity 
              style={styles.monthArrow}
              onPress={() => navigateMonth('next')}
            >
              <Ionicons name="chevron-forward" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.statsButton}
            onPress={() => navigation.navigate('Statistics', { 
              selectedMonth: currentDate 
            })}
          >
            <Ionicons name="stats-chart" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Metrics Row - Between Month and Weekdays */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricsRow}>
          <View style={styles.metricThird}>
            <Text style={styles.horizontalMetric}>
              <Text style={styles.metricLabel}>{t('dashboard.income')}   </Text>
                          <Text style={[styles.metricValue, { color: 'rgba(76, 175, 80, 0.9)' }]}>
              {monthlySummary.totalIncome.toLocaleString()}원
            </Text>
            </Text>
          </View>
          <View style={styles.metricThird}>
            <Text style={styles.horizontalMetric}>
              <Text style={styles.metricLabel}>{t('dashboard.expense')}   </Text>
              <Text style={[styles.metricValue, { color: colors.expense }]}>
                {monthlySummary.totalExpenses.toLocaleString()}원
              </Text>
            </Text>
          </View>
          <View style={styles.metricThird}>
            <Text style={styles.horizontalMetric}>
              <Text style={styles.metricLabel}>{t('dashboard.balance')}   </Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {Math.abs(monthlySummary.balance).toLocaleString()}원
              </Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Weekday Header */}
      <View style={styles.weekdayHeader}>
        {[t('weekdays.short.sun'), t('weekdays.short.mon'), t('weekdays.short.tue'), t('weekdays.short.wed'), t('weekdays.short.thu'), t('weekdays.short.fri'), t('weekdays.short.sat')].map((day, index) => (
          <Text key={index} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
          current={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`}
          enableSwipeMonths={true}
          disableMonthChange={false}
          firstDay={0}
          hideHeader={true}
          onMonthChange={(m) => {
            const dt = new Date(m.year, m.month - 1, 1);
            setCurrentDate(dt);
            
            // 해당 월의 첫날로 selectedDate 설정
            const firstDayOfMonth = `${m.year}-${String(m.month).padStart(2, '0')}-01`;
            setSelectedDate(firstDayOfMonth);
          }}
          style={styles.calendar}
          theme={{
            calendarBackground: colors.surface,
            textDayFontSize: 16,
            textMonthFontSize: 1, // Android doesn't allow 0, use 1 instead
            monthTextColor: 'transparent',
            dayTextColor: colors.text,
            textDisabledColor: '#D1D5DB',
            arrowColor: 'transparent', // Hide arrows
            textDayHeaderFontSize: 1, // Android doesn't allow 0, use 1 instead
            'stylesheet.calendar.header': {
              header: {
                height: 0,
                marginBottom: 0,
                paddingBottom: 0,
              },
              monthText: {
                height: 0,
                opacity: 0,
                fontSize: 1, // Android doesn't allow 0
              },
              arrow: {
                height: 0,
                width: 0,
                opacity: 0,
              },
              dayHeader: {
                height: 0,
                opacity: 0,
              },
            },
            'stylesheet.calendar.main': {
              header: {
                height: 0,
                marginBottom: 0,
              },
              week: {
                marginTop: -4,
                marginBottom: 0,
                paddingTop: 0,
                paddingBottom: 0,
                flexDirection: 'row',
              },
            },
          }}
          dayComponent={({ date, state }) => {
            const key = date?.dateString;
            const sums = sumsByDate[key] || { income: 0, expense: 0 };
            const isSelected = selectedDate === key;
            const isToday = key === todayKey;
            const isDisabled = state === 'disabled';

            return (
              <View style={[styles.dayWrapper, isDisabled && { opacity: 0.35 }]}>
                {isToday && <View pointerEvents="none" style={[styles.overlayBase, styles.todayOverlay]} />}
                {isSelected && <View pointerEvents="none" style={[styles.overlayBase, styles.selectedOverlay]} />}

                <TouchableOpacity
                  style={styles.dayContent}
                  activeOpacity={0.8}
                  onPress={() => {
                    // 단순하고 확실한 방법: 클릭된 날짜의 년-월과 현재 년-월 비교
                    const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
                    const clickedYearMonth = key.slice(0, 7); // "2025-08"
                    
                    // 같은 월의 날짜만 선택 허용
                    if (clickedYearMonth === currentYearMonth) {
                      setSelectedDate(key);
                    }
                  }}
                >
                  <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                    {date.day}
                  </Text>

                  <View style={styles.amountRow}>
                    <Text style={styles.incomeText}>
                      {sums.income ? `+${sums.income.toLocaleString()}` : ' '}
                    </Text>
                    <Text style={styles.expenseText}>
                      {sums.expense ? `-${sums.expense.toLocaleString()}` : ' '}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>

      {/* Day-only List */}
      <View style={styles.dayListContainer}>
        {selectedDate == null ? (
          <Text style={styles.placeholderText}>{t('dashboard.selectDate')}</Text>
        ) : dayTransactions.length === 0 ? (
          <Text style={styles.placeholderText}>{t('dashboard.noTransactions')}</Text>
        ) : (
          <FlatList
            data={dayTransactions}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: 12, paddingTop: 2 }}
            renderItem={renderTransaction}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={8}
          />
        )}
      </View>

      {/* Ad Banner */}
      <View style={styles.adContainer}>
        <AdBanner />
      </View>

      {/* Floating Add Button */}
      {fabVisible && (
        <TouchableOpacity
          style={[
            styles.fab,
            { 
              bottom: insets.bottom + AD_HEIGHT + 24, 
              right: 20, 
              backgroundColor: '#FFF5C8',
              shadowOffset: {
                width: 2,
                height: 3,
              },
              shadowOpacity: 0.15,
              shadowRadius: 4,
            }
          ]}
          onPress={openAddModal}
        >
          <Ionicons name="add" size={32} color="#735D2F" style={{fontWeight: '700'}} />
        </TouchableOpacity>
      )}

      {/* Add Transaction Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        {/* Backdrop that dismisses on press */}
        <Pressable style={styles.backdrop} onPress={closeModal}>
          {/* Modal box: press here should NOT close the modal */}
          <Pressable style={styles.modalContent}>
            {/* 큰 금액 입력 */}
            <View style={styles.amountSection}>
              <Text style={styles.currencySymbol}>₩</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="number-pad"
                value={transactionForm.amount}
                onChangeText={(text) => {
                  const formattedText = formatNumberWithCommas(text);
                  setTransactionForm({...transactionForm, amount: formattedText});
                }}
                autoFocus={true}
              />
            </View>

            {/* Type Selection - 더 큰 버튼들 */}
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionForm.type === 'income' && styles.incomeButtonActive
                ]}
                onPress={() => setTransactionForm({...transactionForm, type: 'income'})}
              >
                <Text style={[
                  styles.typeButtonText,
                  transactionForm.type === 'income' && styles.typeButtonTextActive
                ]}>{t('transaction.type.income')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionForm.type === 'expense' && styles.expenseButtonActive
                ]}
                onPress={() => setTransactionForm({...transactionForm, type: 'expense'})}
              >
                <Text style={[
                  styles.typeButtonText,
                  transactionForm.type === 'expense' && styles.typeButtonTextActive
                ]}>{t('transaction.type.expense')}</Text>
              </TouchableOpacity>
            </View>

            {/* Item Input */}
            <TextInput
              style={styles.itemInput}
              placeholder={t('transaction.memo')}
              value={transactionForm.memo}
              onChangeText={handleMemoChange}
              onSubmitEditing={saveTransaction}
              returnKeyType="done"
            />

            {/* Auto Category Display - 지출일 때만 표시 */}
            {transactionForm.type === 'expense' && transactionForm.memo && transactionForm.memo.trim().length >= 1 && (
              <View style={styles.autoCategoryContainer}>
                <Text style={styles.autoCategoryText}>
                  💡 자동 분류: {getCategoryName(transactionForm.category)}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>{t('app.cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveTransaction}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>{saving ? t('app.saving') : t('app.save')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal
        visible={showNotificationSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotificationSettings(false)}
      >
        <NotificationSettings onClose={() => setShowNotificationSettings(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  topBackground: {
    backgroundColor: '#FFF5C8',
  },

  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    position: 'relative',
  },


  statsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 15,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 15,
  },

  metricsContainer: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
        monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  monthArrow: {
    padding: 8,
    marginHorizontal: 4,
  },
  monthText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricThird: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: { 
    fontSize: 11, 
    color: colors.textMuted, 
    marginBottom: 2 
  },
  metricValue: { 
    fontSize: 15, 
    fontWeight: '500', 
    color: colors.text,
    fontFamily: 'monospace',
    minWidth: 80,
    textAlign: 'right'
  },
  horizontalMetric: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
    marginHorizontal: 0.5,
    paddingHorizontal: 6,
    marginBottom: 0.5,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: colors.bg,
    marginHorizontal: 0.5,
    borderRadius: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  calendar: {
    borderRadius: 16,
    paddingVertical: 0,
  },
  dayWrapper: {
    position: 'relative',
    width: '100%',
    height: 60,
    alignSelf: 'stretch',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dayContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
    marginTop: -2,
  },
  dayNumberSelected: {
    color: colors.accent,
  },
  amountRow: {
    minHeight: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
      incomeText: {
      fontSize: 10,
      fontWeight: '400',
      color: 'rgba(76, 175, 80, 0.9)',
    },
  expenseText: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.expense,
  },
  overlayBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
  todayOverlay: {
    backgroundColor: '#F3F4F6', // Light gray overlay
  },
  selectedOverlay: {
    backgroundColor: 'rgba(255, 246, 200, 0.4)', // 살짝 더 진한 노란색 배경
  },


  txRowContainer: {
    position: 'relative',
    marginHorizontal: 2,
    marginVertical: 1,
  },
  txRow: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
  txIconContainer: {
    marginRight: 12,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txContent: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  txMemo: { 
    fontSize: 15, 
    color: colors.text,
    fontWeight: '500',
    marginBottom: 10,
  },
  txCategory: { 
    fontSize: 11, 
    color: '#9CA3AF',
    marginTop: 2,
  },
  txAmountContainer: {
    alignItems: 'flex-end',
  },
  txAmount: { 
    fontSize: 15, 
    fontWeight: '600',
    fontFamily: 'monospace',
    minWidth: 70,
    textAlign: 'right'
  },

  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },

  adContainer: {
    height: AD_HEIGHT,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 16,
  },

  // 금액 입력 섹션
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    width: '80%',
    alignSelf: 'center',
    marginTop: 10,
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.textMuted,
    marginRight: 10,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.text,
    textAlign: 'right',
    minWidth: 240,
    maxWidth: 280,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    paddingHorizontal: 10,
  },
  
  // 타입 선택 버튼
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15,
    width: '90%',
    alignSelf: 'center',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  incomeButtonActive: {
    backgroundColor: '#D4EFDB',
  },
  expenseButtonActive: {
    backgroundColor: '#FFD6D6',
  },
  typeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMuted,
  },
  typeButtonTextActive: {
    color: colors.text,
  },
  
  // 항목 입력
  itemInput: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    borderRadius: 0,
    padding: 15,
    paddingHorizontal: 0,
    marginBottom: 10,
    fontSize: 17,
    backgroundColor: 'transparent',
    color: colors.text,
    width: '90%',
    alignSelf: 'center',
  },
  autoCategoryContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
    width: '90%',
    alignSelf: 'center',
  },
  autoCategoryText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: colors.text,
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cancelButtonText: {
    fontSize: 17,
    color: colors.text,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#FFF5C8',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 17,
    color: '#735D2F',
    fontWeight: '700',
  },
  dayListContainer: {
    flex: 1,
    minHeight: MIN_TRANSACTION_LIST_HEIGHT,
    marginTop: 6,
    marginHorizontal: 10,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
  },
});



