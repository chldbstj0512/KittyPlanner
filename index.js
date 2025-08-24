import 'react-native-gesture-handler';
import 'react-native-reanimated';          // reanimated 사용 시 권장
import { enableScreens } from 'react-native-screens';
enableScreens(true);

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
