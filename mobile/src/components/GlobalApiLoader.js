import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';
import tokens from '../theme/tokens';
import { subscribeApiActivity } from '../utils/apiActivity';

const GlobalApiLoader = () => {
  const [apiState, setApiState] = useState({ pendingCount: 0, isOffline: false });

  useEffect(() => {
    const unsubscribe = subscribeApiActivity(setApiState);
    return unsubscribe;
  }, []);

  if (!apiState.pendingCount && !apiState.isOffline) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.wrap}>
      {apiState.isOffline ? (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>No internet connection</Text>
        </View>
      ) : null}
      {apiState.pendingCount > 0 ? (
        <View style={styles.loaderPill}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loaderText}>Loading...</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    gap: 8
  },
  loaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: '#DCE6F8',
    ...tokens.shadows.soft
  },
  loaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary
  },
  offlineBanner: {
    borderRadius: 999,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991B1B'
  }
});

export default GlobalApiLoader;
