import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import ScreenContainer from '../components/ScreenContainer';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

const ProfileScreen = () => {
  const { user, refreshProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await refreshProfile();
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Profile load failed', text2: error.message });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [refreshProfile]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await refreshProfile();
      Toast.show({ type: 'success', text1: 'Profile updated' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Refresh failed', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <View style={styles.topRow}>
          <Text style={styles.topLabel}>My Profile</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>

        <View style={styles.identityRow}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={30} color="#0A84FF" />
          </View>
          <View style={styles.identityTextWrap}>
            <Text style={styles.name}>{user?.name || 'RideBuddy User'}</Text>
            <Text style={styles.caption}>Campus Commuter</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconBadge}>
              <Ionicons name="mail-outline" size={14} color="#1D4ED8" />
            </View>
            <Text style={styles.value}>{user?.email || '-'}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <View style={styles.iconBadge}>
              <Ionicons name="call-outline" size={14} color="#1D4ED8" />
            </View>
            <Text style={styles.value}>{user?.phone || 'Not added'}</Text>
          </View>
        </View>
      </View>

      <CustomButton title="Refresh Profile" onPress={handleRefresh} loading={loading} variant="secondary" />
      <CustomButton title="Logout" onPress={logout} variant="danger" style={styles.logoutButton} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EAF0',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  topLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
    textTransform: 'uppercase'
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#DCFCE7'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534'
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  identityTextWrap: {
    flex: 1
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3
  },
  caption: {
    marginTop: 4,
    fontSize: 13,
    color: colors.mutedText,
    fontWeight: '600'
  },
  infoCard: {
    borderWidth: 1,
    borderColor: '#E7ECF2',
    borderRadius: 16,
    backgroundColor: '#FCFDFF',
    padding: 14
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E7ECF2',
    marginVertical: 12
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1
  },
  logoutButton: {
    marginTop: 10
  }
});

export default ProfileScreen;
