import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  // 알림 권한 요청
  requestPermissions: async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('알림 권한이 거부되었습니다.');
        return false;
      }
      
      return true;
    } else {
      console.log('시뮬레이터에서는 푸시 알림을 사용할 수 없습니다.');
      return false;
    }
  },

  // 오후 10시 알림 스케줄링
  scheduleDailyReminder: async () => {
    try {
      // 기존 알림 취소
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // 권한 확인
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('알림 권한이 없어서 스케줄링을 건너뜁니다.');
        return false;
      }
      
      // 오후 10시 (22:00) 알림 설정
      const trigger = {
        hour: 22,
        minute: 0,
        repeats: true, // 매일 반복
      };
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🐱 KittyPlanner',
          body: '오늘의 내역을 입력해보세요',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });
      
      console.log('오후 10시 알림이 설정되었습니다.');
      return true;
    } catch (error) {
      console.error('알림 설정 중 오류:', error);
      return false;
    }
  },

  // 알림 취소
  cancelAllNotifications: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('모든 알림이 취소되었습니다.');
    } catch (error) {
      console.error('알림 취소 중 오류:', error);
    }
  },

  // 알림 상태 확인
  getNotificationStatus: async () => {
    try {
      const permissions = await Notifications.getPermissionsAsync();
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      return {
        permissions: permissions.status,
        scheduledCount: scheduledNotifications.length,
        hasDailyReminder: scheduledNotifications.some(notification => 
          notification.trigger && 
          notification.trigger.hour === 22 && 
          notification.trigger.repeats === true
        ),
      };
    } catch (error) {
      console.error('알림 상태 확인 중 오류:', error);
      return null;
    }
  },

  // 테스트 알림 (즉시 발송)
  sendTestNotification: async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🐱 KittyPlanner',
          body: '테스트 알림입니다!',
          sound: 'default',
        },
        trigger: null, // 즉시 발송
      });
      console.log('테스트 알림이 발송되었습니다.');
    } catch (error) {
      console.error('테스트 알림 발송 중 오류:', error);
    }
  },
};
