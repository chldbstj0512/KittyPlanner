import { Ionicons } from '@expo/vector-icons';

export const CATEGORIES = {
  DINING: {
    id: 'dining',
    name: 'Dining',
    koreanName: '식비',
    icon: 'restaurant',
    color: '#FF6B6B',
    iconType: 'Ionicons'
  },
  ESSENTIALS: {
    id: 'essentials',
    name: 'Essentials',
    koreanName: '생필품',
    icon: 'basket',
    color: '#4ECDC4',
    iconType: 'Ionicons'
  },
  ENTERTAINMENT: {
    id: 'entertainment',
    name: 'Entertainment',
    koreanName: '문화생활',
    icon: 'musical-notes',
    color: '#45B7D1',
    iconType: 'Ionicons'
  },
  HOBBIES: {
    id: 'hobbies',
    name: 'Hobbies & Fun',
    koreanName: '취미',
    icon: 'game-controller',
    color: '#96CEB4',
    iconType: 'Ionicons'
  },
  TRANSPORT: {
    id: 'transport',
    name: 'Transport',
    koreanName: '교통비',
    icon: 'car',
    color: '#FFEAA7',
    iconType: 'Ionicons'
  },
  TRAVEL: {
    id: 'travel',
    name: 'Travel & Leisure',
    koreanName: '여행',
    icon: 'airplane',
    color: '#DDA0DD',
    iconType: 'Ionicons'
  },
  FAMILY: {
    id: 'family',
    name: 'Family & Friends',
    koreanName: '가족·친구',
    icon: 'people',
    color: '#FFB6C1',
    iconType: 'Ionicons'
  },
  SHOPPING: {
    id: 'shopping',
    name: 'Shopping',
    koreanName: '장보기',
    icon: 'bag',
    color: '#F8BBD9',
    iconType: 'Ionicons'
  },
  MISCELLANEOUS: {
    id: 'miscellaneous',
    name: 'Miscellaneous',
    koreanName: '기타',
    icon: 'paw',
    color: '#BDBDBD',
    iconType: 'Ionicons'
  }
};

export const getCategoryIcon = (categoryId) => {
  const category = CATEGORIES[categoryId.toUpperCase()];
  if (!category) return CATEGORIES.MISCELLANEOUS;
  
  return {
    name: category.icon,
    type: category.iconType,
    color: category.color
  };
};

export const getCategoryName = (categoryId, language = 'en') => {
  const category = CATEGORIES[categoryId.toUpperCase()];
  if (!category) return CATEGORIES.MISCELLANEOUS.name;
  
  return language === 'ko' ? category.koreanName : category.name;
};

export const getCategoryColor = (categoryId) => {
  const category = CATEGORIES[categoryId.toUpperCase()];
  return category ? category.color : CATEGORIES.MISCELLANEOUS.color;
};

export const getAllCategories = () => {
  return Object.values(CATEGORIES);
};
