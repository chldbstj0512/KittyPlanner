# ModuPlanner 관리자 대시보드

ModuPlanner 앱의 사용자 데이터 및 통계를 모니터링하는 관리자 대시보드입니다.

## 기능

- **DAU/MAU 추적**: 일일 및 월간 활성 사용자 수
- **거래 통계**: 카테고리별 지출 분석
- **사용자 활동 로그**: 최근 사용자 행동 및 거래 내역
- **실시간 데이터**: Firebase Firestore에서 실시간 데이터 표시

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. Firebase 서비스 계정 키 설정
1. Firebase Console > 프로젝트 설정 > 서비스 계정
2. "새 비공개 키 생성" 클릭
3. 다운로드한 JSON 파일을 `serviceAccountKey.json`으로 저장

### 3. 대시보드 실행
```bash
npm start
```

### 4. 접속
브라우저에서 http://localhost:3000 접속

## 개발 모드

```bash
npm run dev
```

## 주의사항

- `serviceAccountKey.json` 파일은 절대 Git에 커밋하지 마세요
- 프로덕션 환경에서는 환경 변수를 사용하여 서비스 계정 키를 관리하세요
- Firebase 보안 규칙을 적절히 설정하여 데이터 보안을 유지하세요

