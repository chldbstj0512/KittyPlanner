import React, { useState, useEffect, useMemo } from 'react';
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
  Pressable
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DatabaseService } from '../services/DatabaseService';
import { CATEGORIES, getAllCategories, getCategoryName } from '../constants/Categories';
import { suggestCategory } from '../services/CategoryAutoClassifier';
import AdBanner from './AdBanner';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');
const SHOW_AD = true;
const AD_HEIGHT = SHOW_AD ? 72 : 0;
const MIN_TRANSACTION_LIST_HEIGHT = height * 0.25; // 25% of screen height

export default function Dashboard({ navigation }) {
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    momDelta: 0,
    momPct: null
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSuggestedCategory, setAutoSuggestedCategory] = useState(null);
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    type: 'expense',
    category: 'miscellaneous',
    memo: ''
  });

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
    setAutoSuggestedCategory(null);
    setTransactionForm({
      amount: '',
      type: 'expense',
      category: 'miscellaneous',
      memo: ''
    });
  };

  const saveTransaction = async () => {
    if (saving) return;
    if (!transactionForm.amount || !selectedDate) return;

    try {
      setSaving(true);
      const payload = {
        date: selectedDate,
        amount: Number(String(transactionForm.amount).replace(/[^0-9]/g, '')),
        type: transactionForm.type,
        category: transactionForm.category,
        memo: (transactionForm.memo || '').trim(),
      };
      
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
      
      await DatabaseService.addTransaction(payload);
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
    const today = new Date().toISOString().slice(0, 10);
    if (!selectedDate) setSelectedDate(today);
    setModalVisible(true);
  };

  const formatCurrency = (amount) => {
    return `₩${amount.toLocaleString()}`;
  };

  const getCategoryIcon = (categoryId) => {
    const category = CATEGORIES[categoryId.toUpperCase()];
    return category ? category.icon : 'paw';
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // 메모 기반 자동 카테고리 제안
  const handleMemoChange = (memoText) => {
    setTransactionForm(prev => ({
      ...prev,
      memo: memoText
    }));

    // 메모가 3글자 이상일 때만 자동 분류 실행
    if (memoText && memoText.trim().length >= 3) {
      const suggestedCategory = suggestCategory(memoText);
      setAutoSuggestedCategory(suggestedCategory);
      
      // 현재 선택된 카테고리가 'miscellaneous'이거나 
      // 제안된 카테고리가 현재 카테고리와 다를 때만 업데이트
      if (transactionForm.category === 'miscellaneous' || 
          suggestedCategory !== transactionForm.category) {
        setTransactionForm(prev => ({
          ...prev,
          category: suggestedCategory
        }));
      }
    } else {
      setAutoSuggestedCategory(null);
    }
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.txRow}>
      <View style={styles.txLeft}>
        <Text style={styles.txMemo}>{item.memo || '(no memo)'}</Text>
        <Text style={styles.txCategory}>
          {getCategoryName(item.category || 'miscellaneous', 'ko')}
        </Text>
      </View>
      <Text style={[
        styles.txAmount,
        { color: item.type === 'income' ? colors.income : colors.expense }
      ]}>
        {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
      </Text>
    </View>
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4 }]}>
      {/* Compact Header */}
      <View style={styles.compactHeader}>
        {/* Row 1: Month Navigation + Balance */}
        <View style={styles.headerRow}>
          <View style={styles.monthNav}>
            <TouchableOpacity 
              style={styles.chevronButton}
              onPress={() => navigateMonth(-1)}
            >
              <Ionicons name="chevron-back" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.monthText}>{formatMonthYear(currentDate)}</Text>
            <TouchableOpacity 
              style={styles.chevronButton}
              onPress={() => navigateMonth(1)}
            >
              <Ionicons name="chevron-forward" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceValue}>{formatCurrency(monthlySummary.balance)}</Text>
          </View>
        </View>

        {/* Row 2: Income + Expense */}
        <View style={styles.headerRow}>
          <View style={styles.metricHalf}>
            <Text style={styles.metricLabel}>Income</Text>
            <Text style={[styles.metricValue, { color: colors.income }]}>
              {formatCurrency(monthlySummary.totalIncome)}
            </Text>
          </View>
          <View style={styles.metricHalf}>
            <Text style={styles.metricLabel}>Expense</Text>
            <Text style={[styles.metricValue, { color: colors.expense }]}>
              {formatCurrency(monthlySummary.totalExpenses)}
            </Text>
          </View>
        </View>
      </View>

      {/* Weekday Header */}
      <View style={styles.weekdayHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <Text key={index} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          current={currentDate.toISOString().split('T')[0]}
          enableSwipeMonths={true}
          disableMonthChange={false}
          firstDay={0}
          hideHeader={true}
          onMonthChange={(m) => {
            const dt = new Date(m.year, m.month - 1, 1);
            setCurrentDate(dt);
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
                  onPress={() => setSelectedDate(key)}
                >
                  <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                    {date.day}
                  </Text>

                  <View style={styles.amountRow}>
                    <Text style={styles.incomeText}>
                      {sums.income ? `₩${sums.income.toLocaleString()}` : ' '}
                    </Text>
                    <Text style={styles.expenseText}>
                      {sums.expense ? `₩${sums.expense.toLocaleString()}` : ' '}
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
          <Text style={styles.placeholderText}>Select a date to view transactions.</Text>
        ) : dayTransactions.length === 0 ? (
          <Text style={styles.placeholderText}>No transactions.</Text>
        ) : (
          <FlatList
            data={dayTransactions}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: 12 }}
            renderItem={renderTransaction}
          />
        )}
      </View>

      {/* Ad Banner */}
      <View style={styles.adContainer}>
        <AdBanner />
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          { 
            bottom: insets.bottom + AD_HEIGHT + 24, 
            right: 20, 
            backgroundColor: colors.accent 
          }
        ]}
        onPress={openAddModal}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

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
            <Text style={styles.modalTitle}>Add Transaction</Text>
            
            {/* Type Selection */}
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionForm.type === 'income' && styles.typeButtonActive
                ]}
                onPress={() => setTransactionForm({...transactionForm, type: 'income'})}
              >
                <Text style={[
                  styles.typeButtonText,
                  transactionForm.type === 'income' && styles.typeButtonTextActive
                ]}>Income</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionForm.type === 'expense' && styles.typeButtonActive
                ]}
                onPress={() => setTransactionForm({...transactionForm, type: 'expense'})}
              >
                <Text style={[
                  styles.typeButtonText,
                  transactionForm.type === 'expense' && styles.typeButtonTextActive
                ]}>Expense</Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="number-pad"
              value={transactionForm.amount}
              onChangeText={(text) => setTransactionForm({...transactionForm, amount: text})}
            />

            {/* Memo Input */}
            <TextInput
              style={styles.input}
              placeholder="Memo"
              value={transactionForm.memo}
              onChangeText={handleMemoChange}
            />

            {/* Auto-suggestion hint */}
            {autoSuggestedCategory && autoSuggestedCategory !== 'miscellaneous' && (
              <Text style={styles.autoSuggestionHint}>
                💡 자동 분류: {getCategoryName(autoSuggestedCategory, 'ko')}
              </Text>
            )}

            {/* Category Selection */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              {getAllCategories().map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    transactionForm.category === category.id && styles.categoryButtonActive
                  ]}
                  onPress={() => setTransactionForm({...transactionForm, category: category.id})}
                >
                  <Ionicons 
                    name={category.icon} 
                    size={20} 
                    color={transactionForm.category === category.id ? 'white' : colors.text} 
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    transactionForm.category === category.id && styles.categoryButtonTextActive
                  ]}>
                    {category.koreanName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveTransaction}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  compactHeader: {
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 8,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevronButton: {
    padding: 4,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  metricHalf: {
    flex: 1,
  },
  metricLabel: { 
    fontSize: 11, 
    color: colors.textMuted, 
    marginBottom: 2 
  },
  metricValue: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: colors.text 
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
    marginHorizontal: 20,
    marginBottom: 2,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: colors.bg,
    marginHorizontal: 10,
    borderRadius: 0,
    padding: 8,
  },
  calendar: {
    borderRadius: 16,
    paddingVertical: 6,
  },
  dayWrapper: {
    position: 'relative',
    width: '100%',
    height: 48,
    alignSelf: 'stretch',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dayContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 1,
  },
  dayNumberSelected: {
    color: colors.accent,
  },
  amountRow: {
    minHeight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  incomeText: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.income,
  },
  expenseText: {
    fontSize: 8,
    fontWeight: '600',
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
    backgroundColor: 'rgba(232, 81, 81, 0.1)', // Very light accent background
  },


  txRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txLeft: { 
    maxWidth: '70%' 
  },
  txMemo: { 
    fontSize: 14, 
    color: colors.text 
  },
  txCategory: { 
    fontSize: 12, 
    color: colors.textMuted, 
    marginTop: 2 
  },
  txAmount: { 
    fontSize: 14, 
    fontWeight: '700' 
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
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: colors.text,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: colors.accent,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  typeButtonTextActive: {
    color: 'white',
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
  categoryContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: colors.textMuted,
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
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
  autoSuggestionHint: {
    fontSize: 12,
    color: colors.accent,
    marginBottom: 10,
    marginTop: -10,
    fontStyle: 'italic',
  },
});

