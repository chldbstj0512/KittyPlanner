// services/DatabaseService.js
import * as SQLite from 'expo-sqlite';

// 앱 전체에서 공유할 단일 커넥션 프라미스
let dbPromise;
function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('kittyplanner.db'); // 비동기
  }
  return dbPromise;
}

// Helper function to get proper month date range
function getMonthDateRange(year, month) {
  const lastDay = new Date(year, month, 0).getDate(); // month is 1-12
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end, lastDay };
}


export const DatabaseService = {
  initDatabase: async () => {
    try {
      console.log('DatabaseService: Starting database initialization...');
      const db = await getDb();
      console.log('DatabaseService: Database connection established');
      
      await db.execAsync(`
        PRAGMA journal_mode = wal;
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          amount INTEGER NOT NULL,
          type TEXT CHECK(type IN ('income','expense')) NOT NULL,
          category TEXT NOT NULL,
          memo TEXT
        );
      `);
      console.log('DatabaseService: Tables created successfully');
    } catch (error) {
      console.error('DatabaseService: Error during initialization:', error);
      throw error;
    }
  },

  addTransaction: async (t) => {
    console.log('🗄️ [DatabaseService] addTransaction 시작:', t);
    
    const db = await getDb();
    console.log('✅ [DatabaseService] DB 연결 완료');
    
    const result = await db.runAsync(
      'INSERT INTO transactions (date, amount, type, category, memo) VALUES (?, ?, ?, ?, ?)',
      [t.date, t.amount, t.type, t.category, t.memo]
    );
    
    const localId = result.lastInsertRowId;
    console.log('💾 [DatabaseService] 로컬 DB에 저장 완료, ID:', localId);
    
    console.log('🏁 [DatabaseService] addTransaction 완료, 반환 ID:', localId);
    return localId;
  },

  getTransactionsByMonth: async (year, month) => {
    const db = await getDb();
    const { start, end } = getMonthDateRange(year, month);
    const result = await db.getAllAsync(
      'SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC',
      [start, end]
    );
    return result || [];
  },

  getTransactionsByDate: async (date) => {
    const db = await getDb();
    const result = await db.getAllAsync(
      'SELECT * FROM transactions WHERE date = ? ORDER BY id DESC',
      [date]
    );
    return result || [];
  },

  updateTransaction: async (id, t) => {
    const db = await getDb();
    await db.runAsync(
      'UPDATE transactions SET date = ?, amount = ?, type = ?, category = ?, memo = ? WHERE id = ?',
      [t.date, t.amount, t.type, t.category, t.memo, id]
    );
  },

  deleteTransaction: async (id) => {
    const db = await getDb();
    await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  },

  clearAllTransactions: async () => {
    const db = await getDb();
    return db.runAsync('DELETE FROM transactions');
  },

  getMonthlySummary: async (year, month) => {
    const db = await getDb();
    const { start, end } = getMonthDateRange(year, month);
    const rows = await db.getAllAsync(
      `SELECT 
         SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS totalIncome,
         SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS totalExpenses,
         category, type, SUM(amount) AS categoryTotal
       FROM transactions
       WHERE date BETWEEN ? AND ?
       GROUP BY category, type
       ORDER BY categoryTotal DESC`,
      [start, end]
    );
    
    // Ensure we have valid data
    const validRows = rows || [];
    const incomeRow = validRows.find(r => r.type === 'income');
    const expenseRows = validRows.filter(r => r.type === 'expense');
    
    return {
      totalIncome: incomeRow ? (incomeRow.totalIncome || 0) : 0,
      totalExpenses: expenseRows.reduce((sum, row) => sum + (row.categoryTotal || 0), 0),
      categories: expenseRows,
    };
  },

};
