const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Firebase Admin SDK 초기화 (선택적)
let admin = null;
let db = null;

try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin = require('firebase-admin');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  db = admin.firestore();
  console.log('Firebase Admin SDK 초기화 성공');
} catch (error) {
  console.log('Firebase Admin SDK 초기화 실패 - 샘플 데이터 사용');
}

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// API 엔드포인트: 통계 데이터
app.get('/api/stats', async (req, res) => {
  try {
    if (db) {
      // Firebase에서 실제 데이터 가져오기
      const moduRef = db.collection('modu');
      const snapshot = await moduRef.get();
      
      let totalUsers = 0;
      let totalTransactions = 0;
      let todayUsers = 0;
      let thisMonthUsers = 0;
      
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      snapshot.forEach(doc => {
        totalUsers++;
        const userData = doc.data();
        
        // 오늘 로그인한 사용자
        if (userData.lastLoginAt) {
          const lastLogin = userData.lastLoginAt.toDate();
          if (lastLogin.toDateString() === today.toDateString()) {
            todayUsers++;
          }
          
          // 이번 달 로그인한 사용자
          if (lastLogin >= startOfMonth) {
            thisMonthUsers++;
          }
        }
        
        // 사용자의 거래 내역 수 계산
        if (userData.transactionCount) {
          totalTransactions += userData.transactionCount;
        }
      });
      
      res.json({
        dau: todayUsers,
        mau: thisMonthUsers,
        totalUsers: totalUsers,
        totalTransactions: totalTransactions
      });
    } else {
      // 샘플 데이터
      res.json({
        dau: 1,
        mau: 1,
        totalUsers: 1,
        totalTransactions: 0
      });
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// API 엔드포인트: 활동 로그
app.get('/api/activity', async (req, res) => {
  try {
    if (db) {
      // Firebase에서 실제 활동 데이터 가져오기
      const moduRef = db.collection('modu');
      const snapshot = await moduRef.get();
      
      const activities = [];
      snapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.lastLoginAt) {
          activities.push({
            userId: doc.id,
            action: '로그인',
            timestamp: userData.lastLoginAt.toDate().toISOString(),
            deviceInfo: userData.deviceInfo || {}
          });
        }
      });
      
      // 최근 10개 활동만 반환
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      res.json(activities.slice(0, 10));
    } else {
      // 샘플 데이터
      res.json([
        {
          userId: 'sample_user_1',
          action: '앱 실행',
          timestamp: new Date().toISOString(),
          deviceInfo: { platform: 'iOS' }
        }
      ]);
    }
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// API 엔드포인트: 거래 내역
app.get('/api/transactions', async (req, res) => {
  try {
    if (db) {
      // Firebase에서 실제 거래 데이터 가져오기
      const moduRef = db.collection('modu');
      const snapshot = await moduRef.get();
      
      const allTransactions = [];
      
      for (const userDoc of snapshot.docs) {
        const userId = userDoc.id;
        const userTransactionsRef = moduRef.doc(userId).collection('transactions');
        const transactionsSnapshot = await userTransactionsRef.get();
        
        transactionsSnapshot.forEach(transactionDoc => {
          const transactionData = transactionDoc.data();
          allTransactions.push({
            id: transactionDoc.id,
            userId: userId,
            ...transactionData
          });
        });
      }
      
      // 최근 20개 거래만 반환
      allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json(allTransactions.slice(0, 20));
    } else {
      // 샘플 데이터
      res.json([
        {
          id: 'sample_transaction_1',
          userId: 'sample_user_1',
          date: '2025-01-15',
          amount: 15000,
          type: 'expense',
          category: 'dining',
          memo: '점심 식사',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// 메인 페이지
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`관리자 대시보드가 실행되었습니다!`);
  console.log(`🔗 접속 방법: 브라우저에서 **http://localhost:${PORT}** 접속`);
  console.log(`📊 Firebase 연결 상태: ${db ? '✅ 연결됨' : '❌ 연결 안됨 (샘플 데이터 사용)'}`);
  console.log(`\n📋 다음 단계:`);
  console.log(`1. **관리자 대시보드 확인**: http://localhost:${PORT} 접속`);
  console.log(`2. **앱에서 거래 추가**: ModuPlanner 앱에서 거래를 추가해보세요`);
  console.log(`3. **Firebase Console 확인**: 실제 데이터가 저장되는지 확인`);
});

