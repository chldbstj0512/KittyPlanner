import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n/i18n';

export const CATEGORIES = {
  FOOD: {
    id: 'food',
    name: 'Food',
    koreanName: '식비',
    icon: 'cafe',
    color: '#FFB366',
    iconType: 'Ionicons'
  },
  TRANSPORT: {
    id: 'transport',
    name: 'Transport',
    koreanName: '교통비',
    icon: 'car',
    color: '#6B9DFF',
    iconType: 'Ionicons'
  },
  SHOPPING: {
    id: 'shopping',
    name: 'Shopping',
    koreanName: '쇼핑',
    icon: 'bag',
    color: '#8FA3FF',
    iconType: 'Ionicons'
  },
  ENTERTAINMENT: {
    id: 'entertainment',
    name: 'Entertainment',
    koreanName: '여가',
    icon: 'film-outline',
    color: '#FFD93D',
    iconType: 'Ionicons'
  },
  HOBBIES: {
    id: 'hobbies',
    name: 'Hobbies',
    koreanName: '오락',
    icon: 'game-controller',
    color: '#FF6B9D',
    iconType: 'Ionicons'
  },
  BILLS: {
    id: 'bills',
    name: 'Bills',
    koreanName: '공과금',
    icon: 'receipt-outline',
    color: '#E8A3FF',
    iconType: 'Ionicons'
  },
  ESSENTIALS: {
    id: 'essentials',
    name: 'Essentials',
    koreanName: '생활',
    icon: 'home-outline',
    color: '#A3D9A3',
    iconType: 'Ionicons'
  },
  HEALTH: {
    id: 'health',
    name: 'Health',
    koreanName: '의료',
    icon: 'medical-outline',
    color: '#FFB366',
    iconType: 'Ionicons'
  },
  MEDICAL: {
    id: 'medical',
    name: 'Medical',
    koreanName: '의료비',
    icon: 'medical-outline',
    color: '#FF6B6B',
    iconType: 'Ionicons'
  },
  EDUCATION: {
    id: 'education',
    name: 'Education',
    koreanName: '교육',
    icon: 'school-outline',
    color: '#A3FFE8',
    iconType: 'Ionicons'
  },
  TRAVEL: {
    id: 'travel',
    name: 'Travel',
    koreanName: '여행',
    icon: 'airplane-outline',
    color: '#E8FFA3',
    iconType: 'Ionicons'
  },
  MISCELLANEOUS: {
    id: 'miscellaneous',
    name: 'Miscellaneous',
    koreanName: '기타',
    icon: 'star',
    color: '#FFE8A3',
    iconType: 'Ionicons'
  },
  GIFT: {
    id: 'gift',
    name: 'Gift',
    koreanName: '선물',
    icon: 'gift-outline',
    color: '#FFE8F0',
    iconType: 'Ionicons'
  },
  FAMILY: {
    id: 'family',
    name: 'Family',
    koreanName: '가족·친구',
    icon: 'people-outline',
    color: '#FFD1A3',
    iconType: 'Ionicons'
  },
  FIXED_EXPENSE: {
    id: 'fixed_expense',
    name: 'Fixed Expense',
    koreanName: '고정지출',
    icon: 'calendar-outline',
    color: '#A3D9A3',
    iconType: 'Ionicons'
  },
};

export const getCategoryIcon = (categoryId) => {
  // 모든 카테고리에 대한 직접 매핑
  const directMapping = {
    'dining': { name: 'cafe', type: 'Ionicons', color: '#FFB366' },
    'food': { name: 'cafe', type: 'Ionicons', color: '#FFB366' },
    'transport': { name: 'car', type: 'Ionicons', color: '#6B9DFF' },
    'shopping': { name: 'bag', type: 'Ionicons', color: '#8FA3FF' },
    'entertainment': { name: 'game-controller', type: 'Ionicons', color: '#FFD93D' },
    'essentials': { name: 'home-outline', type: 'Ionicons', color: '#A3D9A3' },
    'hobbies': { name: 'game-controller', type: 'Ionicons', color: '#FF6B9D' },
    'bills': { name: 'receipt-outline', type: 'Ionicons', color: '#E8A3FF' },
    'health': { name: 'medical-outline', type: 'Ionicons', color: '#FFB366' },
    'medical': { name: 'medical-outline', type: 'Ionicons', color: '#FF6B6B' },
    'education': { name: 'school-outline', type: 'Ionicons', color: '#A3FFE8' },
    'travel': { name: 'airplane-outline', type: 'Ionicons', color: '#E8FFA3' },
    'miscellaneous': { name: 'star', type: 'Ionicons', color: '#FFE8A3' },
    'family': { name: 'people-outline', type: 'Ionicons', color: '#FFD1A3' },
    'gift': { name: 'gift', type: 'Ionicons', color: '#FFE8F0' },
    'fixed_expense': { name: 'calendar-outline', type: 'Ionicons', color: '#A3D9A3' },
  };
  
  const lowerCaseId = categoryId?.toLowerCase();
  
  if (directMapping[lowerCaseId]) {
    return directMapping[lowerCaseId];
  }
  
  // Fallback to system approach
  const upperCaseId = categoryId.toUpperCase();
  
  // Legacy category mapping for backwards compatibility
  const legacyCategoryMap = {
    'DINING': 'FOOD',
    'FOOD': 'FOOD',
    'ESSENTIALS': 'ESSENTIALS', 
    'HOBBIES': 'HOBBIES',
    'FAMILY': 'FAMILY',
    // 수입 관련 카테고리는 자동 분류에서 제외
  };
  
  // Check if it's a legacy category and map it
  const mappedCategoryId = legacyCategoryMap[upperCaseId] || upperCaseId;
  
  const category = CATEGORIES[mappedCategoryId] || CATEGORIES.MISCELLANEOUS;
  
  return {
    name: category.icon,
    type: category.iconType,
    color: category.color
  };
};

export const getCategoryName = (categoryId, language = null) => {
  const upperCaseId = categoryId.toUpperCase();
  
  // Legacy category mapping for backwards compatibility
  const legacyCategoryMap = {
    'DINING': 'FOOD',
    'ESSENTIALS': 'ESSENTIALS', 
    'HOBBIES': 'HOBBIES',
    'FAMILY': 'FAMILY',
    // 수입 관련 카테고리는 자동 분류에서 제외
  };
  
  // Check if it's a legacy category and map it
  const mappedCategoryId = legacyCategoryMap[upperCaseId] || upperCaseId;
  
  const category = CATEGORIES[mappedCategoryId];
  if (!category) {
    return i18n.t('categories.miscellaneous');
  }
  
  // 카테고리 매핑
  const categoryKeyMap = {
    'FOOD': 'food',
    'TRANSPORT': 'transport',
    'SHOPPING': 'shopping',
    'ENTERTAINMENT': 'entertainment',
    'HOBBIES': 'hobbies',
    'BILLS': 'bills',
    'ESSENTIALS': 'essentials',
    'HEALTH': 'health',
    'MEDICAL': 'medical',
    'EDUCATION': 'education',
    'TRAVEL': 'travel',
    'MISCELLANEOUS': 'miscellaneous',
    'GIFT': 'gift',
    'FAMILY': 'family',
    'FIXED_EXPENSE': 'fixed_expense',
  };
  
  const translationKey = categoryKeyMap[mappedCategoryId] || 'miscellaneous';
  return i18n.t(`categories.${translationKey}`);
};

export const getCategoryColor = (categoryId) => {
  const upperCaseId = categoryId.toUpperCase();
  
  // Legacy category mapping for backwards compatibility
  const legacyCategoryMap = {
    'DINING': 'FOOD',
    'ESSENTIALS': 'ESSENTIALS', 
    'HOBBIES': 'HOBBIES',
    'FAMILY': 'FAMILY',
    // 수입 관련 카테고리는 자동 분류에서 제외
  };
  
  // Check if it's a legacy category and map it
  const mappedCategoryId = legacyCategoryMap[upperCaseId] || upperCaseId;
  
  const category = CATEGORIES[mappedCategoryId];
  const color = category ? category.color : CATEGORIES.MISCELLANEOUS.color;
  
  // 아이콘 배경을 조금 옅게 하기 위해 투명도 적용
  const hexToRgba = (hex, alpha = 0.75) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  return hexToRgba(color, 0.75);
};

export const getAllCategories = () => {
  return Object.values(CATEGORIES);
};
