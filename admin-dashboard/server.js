const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 정적 파일 제공
app.use(express.static(path.join(__dirname)));

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API 엔드포인트 (실제 데이터 연동 시 사용)
app.get('/api/stats', (req, res) => {
    // 실제로는 데이터베이스에서 데이터를 가져와야 함
    const stats = {
        dau: 1250,
        mau: 8500,
        totalUsers: 15000,
        totalTransactions: 45000
    };
    res.json(stats);
});

app.get('/api/activity', (req, res) => {
    // 실제로는 데이터베이스에서 사용자 활동 로그를 가져와야 함
    const activity = [
        { userId: 'user_001', action: '거래 추가', amount: 50000, category: '식비', timestamp: '2025-08-27 14:30:00' },
        { userId: 'user_002', action: '거래 수정', amount: 30000, category: '교통비', timestamp: '2025-08-27 14:25:00' },
        { userId: 'user_003', action: '거래 삭제', amount: 15000, category: '쇼핑', timestamp: '2025-08-27 14:20:00' }
    ];
    res.json(activity);
});

app.listen(PORT, () => {
    console.log(`🐱 KittyPlanner 관리자 대시보드가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`📊 DAU, MAU, 사용자 로그를 확인할 수 있습니다.`);
});

