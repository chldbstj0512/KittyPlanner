# ModuPlanner - Personal Finance Ledger App

A beautiful, cat-themed personal finance management app built with React Native and Expo. Track your income and expenses with an intuitive calendar interface and detailed analytics.

## Features

### 🐱 Main Dashboard
- **Balance Overview**: View total income, expenses, and current balance
- **Interactive Calendar**: Click on dates to view or add transactions
- **Visual Indicators**: Color-coded dots show income (green) and expenses (red) on calendar
- **Floating Add Button**: Cat paw icon for quick transaction entry

### 📊 Statistics & Analytics
- **Pie Chart Visualization**: Donut-style chart showing expense breakdown by category
- **Monthly Filtering**: Select different months to view historical data
- **Category Details**: See both percentage and absolute amounts for each category
- **Korean Language Support**: Category names displayed in Korean

### 💰 Transaction Management
- **Add Transactions**: Simple two-step process (amount/type → memo/category)
- **Edit & Delete**: Full CRUD operations for all transactions
- **Category System**: 9 cat-themed categories with Korean names
- **Local Storage**: SQLite database for offline functionality
- **Cloud Sync**: Firebase Firestore integration for data backup

### 🎨 Design Features
- **Cat Theme**: All icons and design elements follow a playful cat theme
- **Clean UI**: Minimal, modern design with pastel colors
- **Responsive**: Works on both iOS and Android
- **Ad Integration**: Google AdMob banner support

### 🔔 Notifications
- **Daily Reminders**: Push notifications at 10 PM to remind users to log transactions
- **Permission Management**: Graceful handling of notification permissions

## Categories

| Category | Korean Name | Icon | Color |
|----------|-------------|------|-------|
| Dining | 식비 | 🍲 Restaurant | #FF6B6B |
| Essentials | 생필품 | 🛒 Basket | #4ECDC4 |
| Entertainment | 문화생활 | 🎶 Musical Notes | #45B7D1 |
| Hobbies & Fun | 취미 | 🧸 Game Controller | #96CEB4 |
| Transport | 교통비 | 🚌 Car | #FFEAA7 |
| Travel & Leisure | 여행 | 🏖 Airplane | #DDA0DD |
| Family & Friends | 가족·친구 | 👪 People | #FFB6C1 |
| Shopping | 소비/장보기 | 🛍 Bag | #F8BBD9 |
| Fixed Expense | 고정지출 | 📅 Calendar | #4CAF50 |
| Medical | 의료비 | 🏥 Hospital | #FF6B6B |
| Miscellaneous | 기타 | 🐾 Paw | #BDBDBD |

## Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack + Tab)
- **Database**: SQLite (expo-sqlite)
- **Charts**: react-native-chart-kit
- **Icons**: Expo Vector Icons (Ionicons)
- **Ads**: Google AdMob (expo-ads-admob)
- **Calendar**: react-native-calendars
- **Notifications**: Expo Notifications

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ModuPlanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For web
   npm run web
   ```

## AdMob Configuration

### Required Setup
1. **AdMob Account**: Create a new account in [Google AdMob](https://admob.google.com/)
2. **App Registration**: Register your app (iOS/Android) and get App ID
3. **Ad Units**: Create banner ad units and get Ad Unit IDs
4. **Configuration**: Update `app.json` and `AdBanner.js` with your AdMob IDs

## Deployment

### EAS Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for production
eas build --platform ios
eas build --platform android
```

### App Store Submission
```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

## Database Schema

### Local SQLite
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT CHECK(type IN ('income','expense')) NOT NULL,
  category TEXT NOT NULL,
  memo TEXT
);
```

## AdMob Integration

The app includes Google AdMob banner integration. To use your own ad units:

1. Replace the placeholder IDs in `components/AdBanner.js`
2. Update `app.json` with your AdMob app ID
3. Test with test IDs in development

## Future Features

- **Budget Planning**: Set monthly budgets per category
- **Card Management**: Track credit/debit card expenses
- **ML Categorization**: Automatic transaction categorization
- **Export/Import**: Data backup and sharing
- **Multi-language**: Full internationalization support
- **Cloud Sync**: Cross-device synchronization
- **Advanced Analytics**: Trend analysis and forecasting

## Project Structure

```
ModuPlanner/
├── components/
│   ├── Dashboard.js              # Main calendar view
│   ├── Statistics.js             # Analytics and charts
│   ├── TransactionDetails.js     # Transaction management
│   ├── AdBanner.js              # Ad integration
│   ├── NotificationSettings.js   # Notification management
│   └── AppLogo.js               # App logo component
├── services/
│   ├── DatabaseService.js        # SQLite operations
│   ├── NotificationService.js    # Push notifications
│   └── CategoryAutoClassifier.js # Auto-categorization
├── constants/
│   └── Categories.js             # Category definitions
├── assets/                       # Images and icons
├── locales/                      # Internationalization
├── theme/                        # Color schemes
├── utils/                        # Utility functions
├── App.js                        # Main app component
├── eas.json                      # EAS build configuration
└── README.md                    # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please open an issue on GitHub or contact the development team.

---

Made with ❤️ and 🐱 by the ModuPlanner team
