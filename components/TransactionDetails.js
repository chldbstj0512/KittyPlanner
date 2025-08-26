import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DatabaseService } from '../services/DatabaseService';
import { CATEGORIES, getAllCategories, getCategoryName, getCategoryColor, getCategoryIcon } from '../constants/Categories';

export default function TransactionDetails({ selectedDate, onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: '',
    type: 'expense',
    category: 'miscellaneous',
    memo: ''
  });

  useEffect(() => {
    if (selectedDate) {
      loadTransactions();
    }
  }, [selectedDate]);

  const loadTransactions = async () => {
    try {
      const data = await DatabaseService.getTransactionsByDate(selectedDate);
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    }
  };

  const handleEditTransaction = () => {
    if (!editForm.amount || !editForm.memo) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!selectedTransaction || !selectedTransaction.id) {
      Alert.alert('Error', 'No transaction selected for editing');
      return;
    }

    Alert.alert(
      'Confirm Edit',
      'Are you sure you want to update this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              const updatedTransaction = {
                date: selectedDate,
                amount: parseInt(editForm.amount) || 0,
                type: editForm.type || 'expense',
                category: editForm.category || 'miscellaneous',
                memo: editForm.memo || ''
              };

              await DatabaseService.updateTransaction(selectedTransaction.id, updatedTransaction);
              setEditModalVisible(false);
              setSelectedTransaction(null);
              loadTransactions();
            } catch (error) {
              console.error('Error updating transaction:', error);
              Alert.alert('Error', 'Failed to update transaction');
            }
          }
        }
      ]
    );
  };

  const handleDeleteTransaction = (transaction) => {
    if (!transaction || !transaction.id) {
      console.error('No valid transaction provided to handleDeleteTransaction');
      Alert.alert('Error', 'Invalid transaction');
      return;
    }
    
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteTransaction(transaction.id);
              loadTransactions();
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (transaction) => {
    if (!transaction) {
      console.error('No transaction provided to openEditModal');
      return;
    }
    
    setSelectedTransaction(transaction);
    setEditForm({
      amount: (transaction.amount || 0).toString(),
      type: transaction.type || 'expense',
      category: transaction.category || 'miscellaneous',
      memo: transaction.memo || ''
    });
    setEditModalVisible(true);
  };

  const formatCurrency = (amount) => {
    return `₩${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const renderTransaction = ({ item }) => {
    // Safety check for item
    if (!item) {
      return null;
    }
    
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionHeader}>
          <View style={styles.categoryInfo}>
            <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(item.category || 'miscellaneous') }]}>
              <Ionicons 
                name={getCategoryIcon(item.category || 'miscellaneous').name} 
                size={20} 
                color="white" 
              />
            </View>
            <View style={styles.transactionText}>
              <Text style={styles.transactionMemo}>{item.memo || 'No memo'}</Text>
              <Text style={styles.transactionCategory}>
                {getCategoryName(item.category || 'miscellaneous', 'ko')}
              </Text>
            </View>
          </View>
          
          <View style={styles.transactionAmount}>
            <Text style={[
              styles.amountText,
              { color: (item.type || 'expense') === 'income' ? '#4CAF50' : '#F44336' }
            ]}>
              {(item.type || 'expense') === 'income' ? '+' : '-'}{formatCurrency(item.amount || 0)}
            </Text>
          </View>
        </View>
        
        <View style={styles.transactionActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil" size={16} color="#4CAF50" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteTransaction(item)}
          >
            <Ionicons name="trash" size={16} color="#F44336" />
            <Text style={[styles.actionText, { color: '#F44336' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Date */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
      </View>

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          style={styles.transactionList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No transactions for this date</Text>
        </View>
      )}

      {/* Edit Transaction Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Transaction</Text>
            
            {/* Type Selection */}
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  editForm.type === 'income' && styles.typeButtonActive
                ]}
                onPress={() => setEditForm({...editForm, type: 'income'})}
              >
                <Text style={[
                  styles.typeButtonText,
                  editForm.type === 'income' && styles.typeButtonTextActive
                ]}>Income</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  editForm.type === 'expense' && styles.typeButtonActive
                ]}
                onPress={() => setEditForm({...editForm, type: 'expense'})}
              >
                <Text style={[
                  styles.typeButtonText,
                  editForm.type === 'expense' && styles.typeButtonTextActive
                ]}>Expense</Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={editForm.amount}
              onChangeText={(text) => setEditForm({...editForm, amount: text})}
              keyboardType="numeric"
            />

            {/* Memo Input */}
            <TextInput
              style={styles.input}
              placeholder="Memo"
              value={editForm.memo}
              onChangeText={(text) => setEditForm({...editForm, memo: text})}
            />

            {/* Category Selection */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              {getAllCategories().map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    editForm.category === category.id && styles.categoryButtonActive
                  ]}
                  onPress={() => setEditForm({...editForm, category: category.id})}
                >
                  <Ionicons 
                    name={category.icon} 
                    size={20} 
                    color={editForm.category === category.id ? 'white' : category.color} 
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    editForm.category === category.id && styles.categoryButtonTextActive
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
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleEditTransaction}
              >
                <Text style={styles.saveButtonText}>Update</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  dateContainer: {
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  transactionList: {
    flex: 1,
  },
  transactionItem: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionText: {
    flex: 1,
  },
  transactionMemo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginLeft: 10,
    borderRadius: 15,
    backgroundColor: '#f9f9f9',
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#4CAF50',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
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
    width: '90%',
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
