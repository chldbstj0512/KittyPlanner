import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n/i18n';

export const CATEGORIES = {
  FOOD: {
    id: 'food',
    name: 'Food',
    koreanName: '식비',
    icon: 'cafe',
    color: '#FFE8D6',
    iconType: 'Ionicons'
  },
  TRANSPORT: {
    id: 'transport',
    name: 'Transport',
    koreanName: '교통비',
    icon: 'car',
    color: '#FFD6E8',
    iconType: 'Ionicons'
  },
  SHOPPING: {
    id: 'shopping',
    name: 'Shopping',
    koreanName: '쇼핑',
    icon: 'bag',
    color: '#D6E8FF',
    iconType: 'Ionicons'
  },
  ENTERTAINMENT: {
    id: 'entertainment',
    name: 'Entertainment',
    koreanName: '오락',
    icon: 'game-controller',
    color: '#E8FFD6',
    iconType: 'Ionicons'
  },
  BILLS: {
    id: 'bills',
    name: 'Bills',
    koreanName: '공과금',
    icon: 'receipt-outline',
    color: '#F6D6FF',
    iconType: 'Ionicons'
  },
  HEALTH: {
    id: 'health',
    name: 'Health',
    koreanName: '의료',
    icon: 'medical-outline',
    color: '#FFE8D6',
    iconType: 'Ionicons'
  },
  EDUCATION: {
    id: 'education',
    name: 'Education',
    koreanName: '교육',
    icon: 'school-outline',
    color: '#D6FFF6',
    iconType: 'Ionicons'
  },
  TRAVEL: {
    id: 'travel',
    name: 'Travel',
    koreanName: '여행',
    icon: 'airplane-outline',
    color: '#F6FFD6',
    iconType: 'Ionicons'
  },
  MISCELLANEOUS: {
    id: 'miscellaneous',
    name: 'Miscellaneous',
    koreanName: '기타',
    icon: 'star',
    color: '#FFF4C8',
    iconType: 'Ionicons'
  },
  SALARY: {
    id: 'salary',
    name: 'Salary',
    koreanName: '급여',
    icon: 'wallet-outline',
    color: '#E8FFD6',
    iconType: 'Ionicons'
  },
  BUSINESS: {
    id: 'business',
    name: 'Business',
    koreanName: '사업',
    icon: 'briefcase-outline',
    color: '#D6E8FF',
    iconType: 'Ionicons'
  },
  INVESTMENT: {
    id: 'investment',
    name: 'Investment',
    koreanName: '투자',
    icon: 'trending-up-outline',
    color: '#F6D6FF',
    iconType: 'Ionicons'
  },
  GIFT: {
    id: 'gift',
    name: 'Gift',
    koreanName: '선물',
    icon: 'gift-outline',
    color: '#FFD6E8',
    iconType: 'Ionicons'
  }
};

export const getCategoryIcon = (categoryId) => {
  const upperCaseId = categoryId.toUpperCase();
  
  // Legacy category mapping for backwards compatibility
  const legacyCategoryMap = {
    'DINING': 'FOOD',
    'ESSENTIALS': 'SHOPPING', 
    'HOBBIES': 'ENTERTAINMENT',
    'FAMILY': 'GIFT'
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
    'ESSENTIALS': 'SHOPPING', 
    'HOBBIES': 'ENTERTAINMENT',
    'FAMILY': 'GIFT'
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
    'BILLS': 'bills',
    'HEALTH': 'health',
    'EDUCATION': 'education',
    'TRAVEL': 'travel',
    'MISCELLANEOUS': 'miscellaneous',
    'SALARY': 'salary',
    'BUSINESS': 'business',
    'INVESTMENT': 'investment',
    'GIFT': 'gift'
  };
  
  const translationKey = categoryKeyMap[mappedCategoryId] || 'miscellaneous';
  return i18n.t(`categories.${translationKey}`);
};

export const getCategoryColor = (categoryId) => {
  const upperCaseId = categoryId.toUpperCase();
  
  // Legacy category mapping for backwards compatibility
  const legacyCategoryMap = {
    'DINING': 'FOOD',
    'ESSENTIALS': 'SHOPPING', 
    'HOBBIES': 'ENTERTAINMENT',
    'FAMILY': 'GIFT'
  };
  
  // Check if it's a legacy category and map it
  const mappedCategoryId = legacyCategoryMap[upperCaseId] || upperCaseId;
  
  const category = CATEGORIES[mappedCategoryId];
  return category ? category.color : CATEGORIES.MISCELLANEOUS.color;
};

export const getAllCategories = () => {
  return Object.values(CATEGORIES);
};
