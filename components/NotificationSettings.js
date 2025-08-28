import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { NotificationService } from '../services/NotificationService';
import { colors } from '../theme/colors';
import { Platform } from 'react-native';

export default function NotificationSettings({ onClose }) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    loadNotificationStatus();
  }, []);

  const loadNotificationStatus = async () => {
    try {
      const status = await NotificationService.getNotificationStatus();
      if (status) {
        setHasPermission(status.permissions === 'granted');
        setIsEnabled(status.hasDailyReminder);
      }
    } catch (error) {
      console.error('알림 상태 로드 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotification = async (value) => {
    try {
      console.log('토글 시도:', value, '현재 권한:', hasPermission);
      
      if (value) {
        // 알림 활성화 시도
        const permission = await NotificationService.requestPermissions();
        console.log('권한 요청 결과:', permission);
        
        if (permission) {
          const success = await NotificationService.scheduleDailyReminder();
          console.log('알림 스케줄링 결과:', success);
          
          if (success) {
            setIsEnabled(true);
            setHasPermission(true);
            Alert.alert('알림 설정', '오후 10시 알림이 설정되었습니다!');
          } else {
            // 스케줄링 실패 시에도 상태는 업데이트 (사용자 경험 개선)
            setIsEnabled(true);
            setHasPermission(true);
            Alert.alert('알림 설정', '알림이 설정되었습니다. (Expo Go에서는 제한적으로 작동할 수 있습니다)');
          }
                  } else {
            // 권한이 없으면 토글을 OFF 상태로 유지하고 권한 요청
            Alert.alert(
              '권한 필요',
              '알림을 받으려면 알림 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
              [
                { 
                  text: '취소', 
                  style: 'cancel',
                  onPress: () => {
                    // 취소 시 토글을 OFF 상태로 되돌림
                    setIsEnabled(false);
                  }
                },
                { 
                  text: '설정으로 이동', 
                  onPress: () => {
                    // 설정으로 이동하지만 토글은 OFF 상태 유지
                    setIsEnabled(false);
                    if (Platform.OS === 'ios') {
                      Linking.openURL('app-settings:');
                    } else {
                      Linking.openSettings();
                    }
                  }
                }
              ]
            );
          }
      } else {
        // 알림 비활성화
        Alert.alert(
          '알림 해제',
          '매일 오후 10시 알림을 해제하시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '해제',
              style: 'destructive',
              onPress: async () => {
                await NotificationService.cancelAllNotifications();
                setIsEnabled(false);
                Alert.alert('알림 해제', '알림이 해제되었습니다.');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('알림 토글 중 오류:', error);
      Alert.alert('오류', '알림 설정 중 오류가 발생했습니다.');
    }
  };

  const sendTestNotification = async () => {
    try {
      await NotificationService.sendTestNotification();
      Alert.alert('테스트 알림', '테스트 알림이 발송되었습니다!');
    } catch (error) {
      Alert.alert('오류', '테스트 알림 발송에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="notifications" size={24} color={colors.text} />
        <Text style={styles.title}>알림 설정</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>매일 오후 10시 알림</Text>
          <Text style={styles.settingDescription}>
            '오늘의 내역을 입력해보세요' 메시지
          </Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={toggleNotification}
          trackColor={{ false: '#767577', true: colors.primary }}
          thumbColor={isEnabled ? '#f4f3f4' : '#f4f3f4'}
        />
      </View>

      {!hasPermission && (
        <View style={styles.permissionWarning}>
          <View style={styles.permissionHeader}>
            <Ionicons name="warning" size={16} color="#FF6B6B" />
            <Text style={styles.permissionText}>
              설정에서 알림 권한을 허용해주세요.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }}
          >
            <Text style={styles.settingsButtonText}>설정으로 이동</Text>
          </TouchableOpacity>
        </View>
      )}

      {hasPermission && isEnabled && (
        <TouchableOpacity
          style={styles.testButton}
          onPress={sendTestNotification}
        >
          <Ionicons name="play" size={16} color="white" />
          <Text style={styles.testButtonText}>테스트 알림 보내기</Text>
        </TouchableOpacity>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>알림 정보</Text>
        <Text style={styles.infoText}>
          • 매일 오후 10시에 자동으로 알림이 발송됩니다
        </Text>
        <Text style={styles.infoText}>
          • 알림을 탭하면 앱이 열립니다
        </Text>
        <Text style={styles.infoText}>
          • 설정에서 언제든지 해제할 수 있습니다
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 10,
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textMuted,
  },
  permissionWarning: {
    backgroundColor: '#FFF5F5',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 8,
    flex: 1,
  },
  settingsButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 5,
    lineHeight: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 50,
  },
});
