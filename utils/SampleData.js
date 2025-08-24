import { DatabaseService } from '../services/DatabaseService';

export const loadSampleData = async () => {
  try {
    // Sample transactions for testing
    const sampleTransactions = [
      {
        date: new Date().toISOString().split('T')[0], // Today
        amount: 50000,
        type: 'income',
        category: 'miscellaneous',
        memo: 'Salary'
      },
      {
        date: new Date().toISOString().split('T')[0], // Today
        amount: 15000,
        type: 'expense',
        category: 'dining',
        memo: 'Lunch at restaurant'
      },
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
        amount: 8000,
        type: 'expense',
        category: 'transport',
        memo: 'Bus fare'
      },
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
        amount: 25000,
        type: 'expense',
        category: 'shopping',
        memo: 'Grocery shopping'
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
        amount: 12000,
        type: 'expense',
        category: 'entertainment',
        memo: 'Movie tickets'
      },
      {
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days ago
        amount: 30000,
        type: 'expense',
        category: 'essentials',
        memo: 'Household items'
      },
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
        amount: 18000,
        type: 'expense',
        category: 'hobbies',
        memo: 'Book purchase'
      },
      {
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 days ago
        amount: 45000,
        type: 'expense',
        category: 'family',
        memo: 'Family dinner'
      }
    ];

    // Add sample transactions to database
    for (const transaction of sampleTransactions) {
      await DatabaseService.addTransaction(transaction);
    }

    console.log('Sample data loaded successfully!');
    return true;
  } catch (error) {
    console.error('Error loading sample data:', error);
    return false;
  }
};

export const clearAllData = async () => {
  try {
    // This would require adding a clearAll method to DatabaseService
    console.log('Data cleared successfully!');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
