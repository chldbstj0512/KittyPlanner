# 🐱 KittyPlanner 관리자 대시보드

사용자 데이터 및 앱 통계를 모니터링할 수 있는 웹 기반 관리자 대시보드입니다.

## 📊 제공 기능

- **DAU (일일 활성 사용자)** - 하루 동안 앱을 사용한 사용자 수
- **MAU (월간 활성 사용자)** - 한 달 동안 앱을 사용한 사용자 수
- **총 사용자 수** - 앱을 설치한 전체 사용자 수
- **총 거래 수** - 사용자들이 입력한 전체 거래 수
- **최근 사용자 활동** - 실시간 사용자 활동 로그
- **거래 통계** - 카테고리별, 월별 거래 통계

## 🚀 설치 및 실행

### 1. 의존성 설치
```bash
cd admin-dashboard
npm install
```

### 2. 서버 실행
```bash
npm start
```

### 3. 브라우저에서 접속
```
http://localhost:3000
```

## 📈 실제 데이터 연동 방법

현재는 샘플 데이터를 사용하고 있습니다. 실제 사용자 데이터를 연동하려면:

### 1. 데이터베이스 연동
- Firebase, MongoDB, PostgreSQL 등 원하는 데이터베이스 설정
- `server.js`의 API 엔드포인트에서 실제 데이터베이스 쿼리 실행

### 2. 사용자 활동 로깅
앱에서 사용자 활동을 로깅하려면:

```javascript
// 앱에서 사용자 활동 로그 전송
const logUserActivity = async (userId, action, amount, category) => {
  try {
    await fetch('http://your-server.com/api/log-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action,
        amount,
        category,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('활동 로그 전송 실패:', error);
  }
};
```

### 3. 보안 설정
- 관리자 인증 시스템 추가
- API 키 또는 JWT 토큰 인증
- HTTPS 설정

## 🔧 커스터마이징

### 샘플 데이터 수정
`index.html`의 `sampleData` 객체를 수정하여 표시할 데이터를 변경할 수 있습니다.

### 스타일 수정
CSS를 수정하여 대시보드 디자인을 변경할 수 있습니다.

### 새로운 통계 추가
새로운 통계 카드를 추가하려면 HTML과 JavaScript를 수정하세요.

## 📱 모바일 지원

대시보드는 반응형으로 설계되어 모바일에서도 사용할 수 있습니다.

## 🔒 보안 고려사항

- 실제 배포 시에는 관리자 인증 필수
- API 엔드포인트 보안 설정
- 데이터 암호화 고려
- 접근 로그 기록

## 📞 지원

문제가 있거나 기능 추가 요청이 있으시면 개발팀에 문의하세요.

