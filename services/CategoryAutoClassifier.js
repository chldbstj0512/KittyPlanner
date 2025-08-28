// 메모 기반 자동 카테고리 분류 서비스
import { CATEGORIES } from '../constants/Categories';

// 각 카테고리별 키워드 사전
const CATEGORY_KEYWORDS = {
  dining: [
    // 한국어 키워드 - 식비
    '식사', '점심', '저녁', '아침', '간식', '커피', '카페', '음료',
    '라면', '김밥', '도시락', '회', '고기', '삼겹살', '갈비', '불고기',
    '찌개', '국', '면', '파스타',
    '중국집', '일식', '양식', '한식', '분식', '야식',
    '술집', '맥주', '소주', '와인', '막걸리',
    '배달의민족', '배민', '요기요', '쿠팡이츠', '배달',
    '학식', '기식', '식당',
  
    // 장보기/식재료
    '슈퍼', '마트', '롯데마트', '롯데슈퍼', '이마트', '홈플러스', '홈플', 
    '코스트코', '쿠팡',
  
    // 음식/음료
    '햇반', '물', '김치', '샌드위치', '간맥', '치맥', '피맥', '버거',
    '과자', '쿠키', '물냉', '비냉', '냉면', '뿌링클', '뿌링치즈볼', 'bhc', 'bbq',
    '빵', '바나나', '오뎅', '타코야끼', '핫도그', '탄산수', '곱창',
    '떡볶이', '빅맥', '엽떡', '막창', '밥',
    '파바', '던킨', '크리스피', '도넛', '찹쌀', '콜라', '사이다', '우유', '두유',
  
    // 편의점
    'gs25', 'cu', '세븐일레븐', '이마트24', '씨유', '지에스', '편의점',
  
    // 카페
    '스타벅스', '이디야', '할리스', '탐앤탐스', '탐탐', '투썸', '스벅',
    '녹차', '라떼', '커피빈', '설빙', '모찌', '디저트', '케이크',
    '바게트', '크로와상', '크루와상', '마카롱', '아박', '아이스박스',
    '티라미수', '빙수', '에타', '에그타르트', '타르트', '스콘', '휘낭시에',
  
    // 패스트푸드
    '맥도날드', '맥날', 'kfc', '버거킹', '롯데리아',
    '감자튀김', '어니언링', '감튀', '햄버거', '피자', '치킨',
  
    // 영어 키워드
    'restaurant', 'food', 'meal', 'lunch', 'dinner', 'breakfast',
    'coffee', 'cafe', 'drink', 'chicken', 'pizza', 'burger',
    'delivery', 'starbucks', 'mcdonald'
  ],
  
  essentials: [
    // 생활용품 관련
    '세제', '샴푸', '비누', '치약', '칫솔', '화장지', '휴지', '물티슈', '세탁', '청소', '세안',
    '로션', '크림', '마스크팩', '선크림', '바디워시', '린스', '컨디셔너',
    // 영어 키워드
    'shampoo', 'soap', 'toothbrush', 'tissue'
  ],

  medical: [
    // 의료 관련
    '병원', '약국', '외과', '내과', '소아과', '산부인과', '정형외과', '피부과', '안과', '치과', '이비인후과',
    '약', '의료비', '진료비', '감기약', '두통약', '비타민', '영양제', '건강기능식품',
    '검진', '체크업', '예방접종', '주사', '수술', '치료', '처방',
    // 영어 키워드
    'hospital', 'pharmacy', 'medicine', 'doctor', 'clinic', 'medical'
  ],
  
  entertainment: [
    // 여가
    '영화', '영화관', 'cgv', '롯데시네마', '메가박스',
    '공연', '콘서트', '연극', '뮤지컬', '전시회', '박물관', '미술관',
    '독서', '책', '서점', '교보문고', '영풍문고', '알라딘',
    '음악', '앨범', 'cd', '입장권', '티켓', '롯데월드', '에버랜드', '놀이공원', '이월드',

    // 영어 키워드
    'movie', 'cinema', 'concert', 'theater', 'book', 'music'
  ],

  hobbies: [
    // 오락/게임
    '게임', '플레이스테이션', 'ps5', 'ps4', '닌텐도', '스위치', 'xbox', '스팀', 'pc방', '피방', '피씨방', 'PC방',
    '코노', '동노', '노래방',
    // 웹툰/만화
    '복권', '웹툰', '만화', '만화카페', '벌툰', '툰',
    // 운동/스포츠
    '운동', '헬스', '수영', '요가', '필라테스', '테니스', '골프', '축구', '농구', '야구',
    '등산', '자전거', '러닝', '마라톤', '체육관',
    // 취미활동
    '사진', '카메라', '렌즈', '촬영', '인화', '필름',
    '그림', '미술', '화구', '붓', '물감', '크레용',
    // 영어 키워드
    'game', 'playstation', 'nintendo', 'xbox', 'steam', 'gym', 'fitness', 'yoga', 'camera'
  ],
  
  transport: [
    // 교통비
    '지하철', '버스', '택시', '카카오택시', '타다', 'ktx', 'srt', '고속버스', '시외버스',
    '기차', '전철', '교통카드', 't머니', '하나로카드',
    '주유', '기름', '충전', '주차', '주차비', '톨게이트', '하이패스',
    '렌터카', '쏘카', '그린카', '카셰어링', '교통비',
    // 영어 키워드
    'subway', 'bus', 'taxi', 'train', 'gas', 'parking', 'uber', 'transport'
  ],
  
  travel: [
    // 여행
    '여행', '호텔', '숙박', '펜션', '리조트', '모텔', '민박', '에어비앤비', '야놀자', '여기어때',
    '항공', '비행기', '대한항공', '아시아나', '진에어', '제주항공', '티웨이', '피치',
    '여행사', '하나투어', '모두투어', '노랑풍선',
    '관광', '명소', '테마파크', '놀이공원', '롯데월드', '에버랜드', '디즈니랜드',
    '온천', 'spa', '마사지', '찜질방', '사우나',
    // 영어 키워드
    'travel', 'hotel', 'flight', 'airline', 'resort', 'airbnb', 'booking', 'trip', 'vacation'
  ],
  
  family: [
    // 가족, 친구
    '가족', '부모님', '어머니', '아버지', '엄마', '아빠', '형', '누나', '언니', '동생',
    '친구', '동료', '회식', '모임', '파티', '생일', '데이트',
    // 약속/회식
    '약속', '회식',
    // 연인 관련
    '여자친구', '남자친구', '여친', '남친', '주년', '기념일',
    '육아', '기저귀', '분유', '아기용품', '장난감',
    // 모임비, 회비 관련
    '계비', '회비', '모임비', '친목비',
    // 선물 관련
    '선물', '용돈', '축하금',
    // 영어 키워드
    'family', 'friend', 'party', 'birthday', 'baby', 'toy', 'gift',
    // 경조사 관련
    '축의금', '부의금', '경조사', '결혼식', '돌잔치', '장례식',
    '출산', '백일', '돌', '성년식', '졸업식', '입학식',
    '환갑', '칠순', '팔순', '구순',
    '상조', '조문', '문상', '조의금',
    // 영어 키워드
    'wedding', 'funeral', 'ceremony', 'celebration'
  ],
  
  shopping: [
    // 쇼핑 관련
    '쇼핑', '옷', '티', '셔츠', '반팔', '긴팔', '바지', '치마', '수선', 
    '의류', '신발', '가방', '액세서리', '화장품', '향수',
    '백화점', '롯데백화점', '신세계', '현대백화점', '롯백', '롯데', '현백', '현대',
    '온라인쇼핑', '11번가', 'g마켓', '옥션', '네이버쇼핑', '티몬', '위메프',
    // 추가 쇼핑몰
    '다이소', '스타필드', '올리브영', '올영', '당근',
    '지마켓', '인터파크', '하이마트', '지그재그', '에이블리',
    '전자제품', '휴대폰', '스마트폰', '컴퓨터', '노트북',
    '가구', '침대', '소파', '책상', '의자', '가전제품', '냉장고', '세탁기', '에어컨',

    // 영어 키워드
    'shopping', 'clothes', 'shoes', 'bag', 'cosmetics', 'perfume', 'electronics', 'computer', 'phone'
  ],

  miscellaneous: [
    // 기타
    '기타', '잡비', '기부', '세금', '과태료', '벌금', '수수료',
    // 영어 키워드
    'fee', 'tax', 'misc'
  ],
  
  fixed_expense: [
    // 고정지출 관련
    '고정지출', '정기지출', '월세', '전세', '관리비', '전기세', '가스비', '수도세', '통신비', '인터넷비',
    '핸드폰요금', '보험', '보험료', '연회비', '멤버십', '구독료', '정기구독', '월구독', '연구독',
    '대출이자', '카드연회비', '은행수수료', '정기납부', '자동이체', '자동납부',
    '아파트관리비', '오피스텔관리비', '원룸관리비', '단지관리비',
    'skt', 'kt', 'lg', '통신사', '요금제', '월정액',
    '국민연금', '건강보험', '고용보험', '산재보험', '4대보험',
    '자동차보험', '생명보험', '실비보험', '의료보험',
    '신용카드', '체크카드', '카드', '연회비',
    // 구독 서비스
    '구독', '넷플릭스', '넷플', '유튜브', '유튜브프리미엄', '애플뮤직', 'gpt', '아이클라우드',
    '스포티파이', '멜론', '스트리밍', '디즈니플러스', '웨이브', '티빙', '쿠팡플레이',
    '애플원', '애플tv', '애플뉴스', '애플피트니스', '애플아케이드',
    '구글원', '구글플레이패스', '구글드라이브', '구글포토',
    '마이크로소프트365', '오피스365', '원드라이브',
    '아마존프라임', '프라임비디오', '프라임뮤직',
    '클라우드', '드롭박스', '박스', '원노트', '에버노트',
    // 요금 관련
    '요금', '월요금', '정기요금', '서비스요금',
    // 영어 키워드
    'rent', 'utility', 'insurance', 'subscription', 'membership', 'fee', 'monthly', 'regular', 'fixed',
    'netflix', 'youtube', 'spotify', 'apple', 'icloud', 'gpt', 'chatgpt', 'streaming'
  ]
};

/**
 * 메모 텍스트를 분석하여 가장 적합한 카테고리를 추천합니다.
 * @param {string} memo - 사용자가 입력한 메모
 * @returns {string} - 추천 카테고리 ID
 */
export const suggestCategory = (memo) => {
  if (!memo || typeof memo !== 'string') {
    console.log('suggestCategory: No memo provided, returning miscellaneous');
    return 'miscellaneous';
  }
  
  // 메모를 소문자로 변환하여 대소문자 구분 없이 매칭
  const normalizedMemo = memo.toLowerCase().trim();
  console.log('suggestCategory: Analyzing memo:', normalizedMemo);
  
  // 각 카테고리별로 점수 계산
  const categoryScores = {};
  
  Object.keys(CATEGORY_KEYWORDS).forEach(categoryId => {
    categoryScores[categoryId] = 0;
    
    CATEGORY_KEYWORDS[categoryId].forEach(keyword => {
      const normalizedKeyword = keyword.toLowerCase();
      
      // 정확한 단어 매칭 (한글에 더 적합한 정규식)
      const exactMatchRegex = new RegExp(`(^|\\s)${normalizedKeyword}(\\s|$)`, 'i');
      if (exactMatchRegex.test(normalizedMemo)) {
        categoryScores[categoryId] += 20; // 정확한 매칭에 매우 높은 점수
        console.log(`suggestCategory: Exact match found - "${normalizedKeyword}" in category "${categoryId}"`);
      }
      // 부분 문자열 매칭
      else if (normalizedMemo.includes(normalizedKeyword)) {
        categoryScores[categoryId] += 2; // 부분 매칭에 낮은 점수
        console.log(`suggestCategory: Partial match found - "${normalizedKeyword}" in category "${categoryId}"`);
      }
      // 디버깅: 정확한 매칭이 실패한 경우 로그
      if (normalizedKeyword === '선물' && normalizedMemo === '선물') {
        console.log(`suggestCategory: Debug - keyword: "${normalizedKeyword}", memo: "${normalizedMemo}", regex test: ${exactMatchRegex.test(normalizedMemo)}`);
      }
      // 디버깅을 위한 로그 추가
      console.log(`suggestCategory: Checking keyword "${normalizedKeyword}" against memo "${normalizedMemo}"`);
    });
  });
  
  console.log('suggestCategory: Category scores:', categoryScores);
  
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
  if (highestScore < 1) {
    console.log('suggestCategory: Score too low, returning miscellaneous');
    return 'miscellaneous';
  }
  
  console.log(`suggestCategory: Best category "${bestCategory}" with score ${highestScore}`);
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
      
      const exactMatchRegex = new RegExp(`(^|\\s)${normalizedKeyword}(\\s|$)`, 'i');
      if (exactMatchRegex.test(normalizedMemo)) {
        categoryScores[categoryId] += 20;
      } else if (normalizedMemo.includes(normalizedKeyword)) {
        categoryScores[categoryId] += 2;
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
