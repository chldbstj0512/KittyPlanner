import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { DatabaseService } from '../services/DatabaseService';
import { CATEGORIES, getAllCategories } from '../constants/Categories';
import AdBanner from './AdBanner';
import DevHelper from './DevHelper';


const { width } = Dimensions.get('window');

export default function Dashboard({ navigation }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  });
  const [markedDates, setMarkedDates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    type: 'expense',
    category: 'miscellaneous',
    memo: ''
  });

  useEffect(() => {
    loadMonthlyData();
  }, [currentDate]);

  const loadMonthlyData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const transactions = await DatabaseService.getTransactionsByMonth(year, month);
      const summary = await DatabaseService.getMonthlySummary(year, month);
      
      // Ensure we have valid data
      const validTransactions = transactions || [];
      const validSummary = summary || { totalIncome: 0, totalExpenses: 0 };
      
      setTransactions(validTransactions);
      setMonthlySummary({
        totalIncome: validSummary.totalIncome || 0,
        totalExpenses: validSummary.totalExpenses || 0,
        balance: (validSummary.totalIncome || 0) - (validSummary.totalExpenses || 0)
      });

      // Create marked dates for calendar
      const marked = {};
      validTransactions.forEach(transaction => {
        if (transaction && transaction.date) {
          const date = transaction.date;
          if (!marked[date]) {
            marked[date] = { dots: [] };
          }
          
          const dotColor = transaction.type === 'income' ? '#4CAF50' : '#F44336';
          marked[date].dots.push({ color: dotColor });
        }
      });
      setMarkedDates(marked);
    } catch (error) {
      console.error('Error loading monthly data:', error);
      // Set default values on error
      setTransactions([]);
      setMonthlySummary({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0
      });
      setMarkedDates({});
    }
  };

  const handleAddTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.memo) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const transaction = {
        date: selectedDate,
        amount: parseInt(transactionForm.amount),
        type: transactionForm.type,
        category: transactionForm.category,
        memo: transactionForm.memo
      };

      await DatabaseService.addTransaction(transaction);
      setModalVisible(false);
      setTransactionForm({
        amount: '',
        type: 'expense',
        category: 'miscellaneous',
        memo: ''
      });
      loadMonthlyData();
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction');
    }
  };

  const formatCurrency = (amount) => {
    return `₩${amount.toLocaleString()}`;
  };

  const getCategoryIcon = (categoryId) => {
    const category = CATEGORIES[categoryId.toUpperCase()];
    return category ? category.icon : 'paw';
  };

  return (
    <View style={styles.container}>
        <DevHelper />
        <ScrollView style={styles.scrollView}>
          {/* Balance Cards */}
          <View style={styles.balanceContainer}>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={[styles.balanceAmount, { color: monthlySummary.balance >= 0 ? '#4CAF50' : '#F44336' }]}>
                {formatCurrency(monthlySummary.balance)}
              </Text>
            </View>
            
            <View style={styles.incomeExpenseRow}>
              <View style={[styles.miniCard, { backgroundColor: '#E8F5E8' }]}>
                <Text style={styles.miniLabel}>Income</Text>
                <Text style={[styles.miniAmount, { color: '#4CAF50' }]}>
                  {formatCurrency(monthlySummary.totalIncome)}
                </Text>
              </View>
              
              <View style={[styles.miniCard, { backgroundColor: '#FFEBEE' }]}>
                <Text style={styles.miniLabel}>Expenses</Text>
                <Text style={[styles.miniAmount, { color: '#F44336' }]}>
                  {formatCurrency(monthlySummary.totalExpenses)}
                </Text>
              </View>
            </View>
          </View>

          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <Calendar
              current={currentDate.toISOString().split('T')[0]}
              onDayPress={(day) => {
                // Check if there are transactions for this day
                const dayTransactions = transactions.filter(t => t.date === day.dateString);
                if (dayTransactions.length > 0) {
                  // Show transaction details
                  navigation.navigate('TransactionDetails', { date: day.dateString });
                } else {
                  // Show add transaction modal
                  setSelectedDate(day.dateString);
                  setModalVisible(true);
                }
              }}
              markedDates={markedDates}
              markingType={'multi-dot'}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: '#4CAF50',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#4CAF50',
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                dotColor: '#4CAF50',
                selectedDotColor: '#ffffff',
                arrowColor: '#4CAF50',
                monthTextColor: '#2d4150',
                indicatorColor: '#4CAF50',
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13
              }}
            />
          </View>
        </ScrollView>

        {/* Ad Banner */}
        <AdBanner />

        {/* Floating Add Button */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => {
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setModalVisible(true);
          }}
        >
          <Ionicons name="paw" size={24} color="white" />
        </TouchableOpacity>

      {/* Add Transaction Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
              value={transactionForm.amount}
              onChangeText={(text) => setTransactionForm({...transactionForm, amount: text})}
              keyboardType="numeric"
            />

            {/* Memo Input */}
            <TextInput
              style={styles.input}
              placeholder="Memo"
              value={transactionForm.memo}
              onChangeText={(text) => setTransactionForm({...transactionForm, memo: text})}
            />

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
                    color={transactionForm.category === category.id ? 'white' : category.color} 
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
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddTransaction}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
              </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  balanceContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  balanceCard: {
    alignItems: 'center',
    marginBottom: 15,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  incomeExpenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniCard: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  miniLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  miniAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarContainer: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    borderRadius: 10,
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
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
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
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 15,
    marginLeft: 10,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});
