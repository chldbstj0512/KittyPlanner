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
      console.log('Push notifications not available in simulator.');
      return false;
    }
  },

  // 오후 10시 알림 스케줄링 (현지 시간 기준)
  scheduleDailyReminder: async () => {
    try {
      // 기존 알림 취소
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // 권한 확인
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permission not granted, skipping scheduling.');
        return false;
      }
      
      // 현지 시간 기준 오후 10시 (22:00) 알림 설정
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
      
      console.log('Daily reminder scheduled for 10 PM local time.');
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

  // 1분 후 테스트 알림 (실제 스케줄링 테스트)
  sendTestNotificationIn1Minute: async () => {
    try {
      const now = new Date();
      const triggerDate = new Date(now.getTime() + 60 * 1000); // 1분 후
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🐱 KittyPlanner',
          body: '1분 후 테스트 알림입니다!',
          sound: 'default',
        },
        trigger: triggerDate,
      });
      console.log('1분 후 테스트 알림이 스케줄되었습니다.');
      return true;
    } catch (error) {
      console.error('1분 후 테스트 알림 스케줄링 중 오류:', error);
      return false;
    }
  },

  // 5분 후 테스트 알림 (실제 스케줄링 테스트)
  sendTestNotificationIn5Minutes: async () => {
    try {
      const now = new Date();
      const triggerDate = new Date(now.getTime() + 5 * 60 * 1000); // 5분 후
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🐱 KittyPlanner',
          body: '5분 후 테스트 알림입니다!',
          sound: 'default',
        },
        trigger: triggerDate,
      });
      console.log('5분 후 테스트 알림이 스케줄되었습니다.');
      return true;
    } catch (error) {
      console.error('5분 후 테스트 알림 스케줄링 중 오류:', error);
      return false;
    }
  },
};
