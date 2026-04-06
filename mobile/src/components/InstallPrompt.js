import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import tokens from '../theme/tokens';

const SESSION_KEY = 'ridebuddy_install_prompt_hidden';

const isMobileBrowser = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
};

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  const allowPrompt = useMemo(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return false;
    }
    if (!isMobileBrowser()) {
      return false;
    }
    return window.sessionStorage.getItem(SESSION_KEY) !== '1';
  }, []);

  useEffect(() => {
    if (!allowPrompt || Platform.OS !== 'web' || typeof window === 'undefined') {
      return undefined;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [allowPrompt]);

  const dismissForSession = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    }
    setVisible(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      dismissForSession();
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismissForSession();
  };

  if (!visible || Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.banner}>
        <Text style={styles.title}>Install RideBuddy on your phone!</Text>
        <View style={styles.actionsRow}>
          <Pressable style={styles.installBtn} onPress={handleInstall}>
            <Text style={styles.installBtnText}>Install</Text>
          </Pressable>
          <Pressable style={styles.notNowBtn} onPress={dismissForSession}>
            <Text style={styles.notNowText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 12,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'box-none'
  },
  banner: {
    width: 'min(94vw, 440px)',
    backgroundColor: '#1a56db',
    borderRadius: tokens.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    boxShadow: '0 10px 30px rgba(26,86,219,0.32)'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8
  },
  installBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  installBtnText: {
    color: '#1a56db',
    fontSize: 13,
    fontWeight: '800'
  },
  notNowBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  notNowText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});

export default InstallPrompt;
