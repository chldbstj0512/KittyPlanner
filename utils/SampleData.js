// utils/SampleData.js
export const sampleTransactions = [
  {
    id: 1,
    date: '2025-01-15',
    amount: 15000,
    type: 'expense',
    category: 'dining',
    memo: '점심 식사',
    firebaseId: null,
    synced: 0
  }
];

// Firebase 테스트용 단일 거래 데이터
export const testTransaction = {
  date: '2025-01-15',
  amount: 15000,
  type: 'expense',
  category: 'dining',
  memo: '점심 식사 - Firebase 테스트'
};

