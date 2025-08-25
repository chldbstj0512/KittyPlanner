// 메모 기반 자동 카테고리 분류 서비스
import { CATEGORIES } from '../constants/Categories';

// 각 카테고리별 키워드 사전
const CATEGORY_KEYWORDS = {
  dining: [
    // 한국어 키워드
    '식사', '밥', '점심', '저녁', '아침', '간식', '커피', '카페', '음료', '치킨', '피자', '햄버거', 
    '라면', '김밥', '도시락', '회', '고기', '삼겹살', '갈비', '불고기', '찌개', '국', '면', '파스타',
    '중국집', '일식', '양식', '한식', '분식', '야식', '술', '맥주', '소주', '와인', '막걸리',
    '스타벅스', '이디야', '할리스', '탐앤탐스', '맥도날드', 'kfc', '버거킹', '롯데리아',
    '배달의민족', '요기요', '쿠팡이츠', '배달',
    // 영어 키워드
    'restaurant', 'food', 'meal', 'lunch', 'dinner', 'breakfast', 'coffee', 'cafe', 'drink',
    'chicken', 'pizza', 'burger', 'delivery', 'starbucks', 'mcdonald'
  ],
  
  essentials: [
    // 생활용품 관련
    '세제', '샴푸', '비누', '치약', '칫솔', '화장지', '휴지', '물티슈', '세탁', '청소', '세안',
    '로션', '크림', '마스크팩', '선크림', '바디워시', '린스', '컨디셔너',
    '약', '병원', '약국', '의료비', '진료비', '감기약', '두통약', '비타민',
    '올리브영', '다이소', 'gs25', 'cu', '세븐일레븐', '이마트24',
    // 영어 키워드
    'pharmacy', 'medicine', 'hospital', 'shampoo', 'soap', 'toothbrush', 'tissue'
  ],
  
  entertainment: [
    // 문화생활
    '영화', '영화관', 'cgv', '롯데시네마', '메가박스', '넷플릭스', '유튜브', '멜론', '스포티파이',
    '공연', '콘서트', '연극', '뮤지컬', '전시회', '박물관', '미술관',
    '독서', '책', '서점', '교보문고', '영풍문고', '알라딘',
    '음악', '앨범', 'cd', '스트리밍',
    // 영어 키워드
    'movie', 'cinema', 'netflix', 'youtube', 'spotify', 'concert', 'theater', 'book', 'music'
  ],
  
  hobbies: [
    // 취미활동
    '게임', '플레이스테이션', 'ps5', 'ps4', '닌텐도', '스위치', 'xbox', '스팀', 'pc방',
    '운동', '헬스', '수영', '요가', '필라테스', '테니스', '골프', '축구', '농구', '야구',
    '등산', '자전거', '러닝', '마라톤', '체육관',
    '사진', '카메라', '렌즈', '촬영', '인화',
    '그림', '미술', '화구', '붓', '물감', '크레용',
    // 영어 키워드
    'game', 'playstation', 'nintendo', 'xbox', 'steam', 'gym', 'fitness', 'yoga', 'camera'
  ],
  
  transport: [
    // 교통수단
    '지하철', '버스', '택시', '카카오택시', '타다', 'ktx', 'srt', '고속버스', '시외버스',
    '기차', '전철', '교통카드', 't머니', '하나로카드',
    '주유', '기름', '충전', '주차', '주차비', '톨게이트', '하이패스',
    '렌터카', '쏘카', '그린카', '카셰어링',
    // 영어 키워드
    'subway', 'bus', 'taxi', 'train', 'gas', 'parking', 'uber', 'transport'
  ],
  
  travel: [
    // 여행 관련
    '여행', '호텔', '숙박', '펜션', '리조트', '모텔', '민박', '에어비앤비', '야놀자', '여기어때',
    '항공', '비행기', '대한항공', '아시아나', '진에어', '제주항공', '티웨이', '피치',
    '여행사', '하나투어', '모두투어', '노랑풍선',
    '관광', '명소', '테마파크', '놀이공원', '롯데월드', '에버랜드', '디즈니랜드',
    '온천', 'spa', '마사지', '찜질방', '사우나',
    // 영어 키워드
    'travel', 'hotel', 'flight', 'airline', 'resort', 'airbnb', 'booking', 'trip', 'vacation'
  ],
  
  family: [
    // 가족, 친구 관련
    '가족', '부모님', '어머니', '아버지', '엄마', '아빠', '형', '누나', '언니', '동생',
    '친구', '동료', '회식', '모임', '파티', '생일', '결혼식', '돌잔치', '장례식',
    '선물', '용돈', '축의금', '부의금', '경조사', '데이트',
    '육아', '기저귀', '분유', '아기용품', '장난감',
    // 영어 키워드
    'family', 'friend', 'gift', 'party', 'birthday', 'wedding', 'baby', 'toy'
  ],
  
  shopping: [
    // 쇼핑 관련
    '쇼핑', '옷', '의류', '신발', '가방', '액세서리', '화장품', '향수',
    '백화점', '롯데백화점', '신세계', '현대백화점', '이마트', '홈플러스', '코스트코',
    '온라인쇼핑', '쿠팡', '11번가', 'g마켓', '옥션', '네이버쇼핑', '티몬', '위메프',
    '지마켓', '인터파크', '하이마트', '전자제품', '휴대폰', '스마트폰', '컴퓨터', '노트북',
    '가구', '침대', '소파', '책상', '의자', '가전제품', '냉장고', '세탁기', '에어컨',
    // 영어 키워드
    'shopping', 'clothes', 'shoes', 'bag', 'cosmetics', 'perfume', 'electronics', 'computer', 'phone'
  ],
  
  miscellaneous: [
    // 기타
    '기타', '잡비', '기부', '세금', '과태료', '벌금', '수수료', '연회비', '멤버십',
    '보험', '적금', '예금', '투자', '주식', '펀드', '대출', '이자',
    '인터넷', '통신비', '핸드폰요금', '전기세', '가스비', '수도세', '관리비', '월세', '전세',
    // 영어 키워드
    'fee', 'tax', 'insurance', 'investment', 'internet', 'utility', 'rent', 'misc'
  ]
};

/**
 * 메모 텍스트를 분석하여 가장 적합한 카테고리를 추천합니다.
 * @param {string} memo - 사용자가 입력한 메모
 * @returns {string} - 추천 카테고리 ID
 */
export const suggestCategory = (memo) => {
  if (!memo || typeof memo !== 'string') {
    return 'miscellaneous';
  }
  
  // 메모를 소문자로 변환하여 대소문자 구분 없이 매칭
  const normalizedMemo = memo.toLowerCase().trim();
  
  // 각 카테고리별로 점수 계산
  const categoryScores = {};
  
  Object.keys(CATEGORY_KEYWORDS).forEach(categoryId => {
    categoryScores[categoryId] = 0;
    
    CATEGORY_KEYWORDS[categoryId].forEach(keyword => {
      const normalizedKeyword = keyword.toLowerCase();
      
      // 정확한 단어 매칭 (공백이나 특수문자로 구분된 독립적인 단어)
      const wordBoundaryRegex = new RegExp(`\\b${normalizedKeyword}\\b`, 'i');
      if (wordBoundaryRegex.test(normalizedMemo)) {
        categoryScores[categoryId] += 10; // 정확한 매칭에 높은 점수
      }
      // 부분 문자열 매칭
      else if (normalizedMemo.includes(normalizedKeyword)) {
        categoryScores[categoryId] += 5; // 부분 매칭에 낮은 점수
      }
    });
  });
  
  // 가장 높은 점수를 받은 카테고리 찾기
  let bestCategory = 'miscellaneous';
  let highestScore = 0;
  
  Object.entries(categoryScores).forEach(([categoryId, score]) => {
    if (score > highestScore) {
      highestScore = score;
      bestCategory = categoryId;
    }
  });
  
  // 최소 점수 임계값 설정 (너무 낮은 점수면 기타로 분류)
  if (highestScore < 5) {
    return 'miscellaneous';
  }
  
  return bestCategory;
};

/**
 * 메모와 매칭된 키워드들을 반환합니다 (디버깅/확인 용도)
 * @param {string} memo - 사용자가 입력한 메모
 * @param {string} categoryId - 카테고리 ID
 * @returns {Array} - 매칭된 키워드 배열
 */
export const getMatchedKeywords = (memo, categoryId) => {
  if (!memo || !categoryId || !CATEGORY_KEYWORDS[categoryId]) {
    return [];
  }
  
  const normalizedMemo = memo.toLowerCase().trim();
  const matchedKeywords = [];
  
  CATEGORY_KEYWORDS[categoryId].forEach(keyword => {
    const normalizedKeyword = keyword.toLowerCase();
    if (normalizedMemo.includes(normalizedKeyword)) {
      matchedKeywords.push(keyword);
    }
  });
  
  return matchedKeywords;
};

/**
 * 모든 카테고리에 대한 점수를 반환합니다 (디버깅 용도)
 * @param {string} memo - 사용자가 입력한 메모
 * @returns {Object} - 카테고리별 점수 객체
 */
export const getCategoryScores = (memo) => {
  if (!memo || typeof memo !== 'string') {
    return {};
  }
  
  const normalizedMemo = memo.toLowerCase().trim();
  const categoryScores = {};
  
  Object.keys(CATEGORY_KEYWORDS).forEach(categoryId => {
    categoryScores[categoryId] = 0;
    
    CATEGORY_KEYWORDS[categoryId].forEach(keyword => {
      const normalizedKeyword = keyword.toLowerCase();
      
      const wordBoundaryRegex = new RegExp(`\\b${normalizedKeyword}\\b`, 'i');
      if (wordBoundaryRegex.test(normalizedMemo)) {
        categoryScores[categoryId] += 10;
      } else if (normalizedMemo.includes(normalizedKeyword)) {
        categoryScores[categoryId] += 5;
      }
    });
  });
  
  return categoryScores;
};

/**
 * 새로운 키워드를 특정 카테고리에 추가합니다 (학습 기능)
 * @param {string} categoryId - 카테고리 ID
 * @param {string} keyword - 추가할 키워드
 */
export const addKeywordToCategory = (categoryId, keyword) => {
  if (CATEGORY_KEYWORDS[categoryId] && keyword && !CATEGORY_KEYWORDS[categoryId].includes(keyword.toLowerCase())) {
    CATEGORY_KEYWORDS[categoryId].push(keyword.toLowerCase());
    // 실제 앱에서는 이 데이터를 AsyncStorage나 데이터베이스에 저장해야 합니다
    console.log(`Added keyword "${keyword}" to category "${categoryId}"`);
  }
};
