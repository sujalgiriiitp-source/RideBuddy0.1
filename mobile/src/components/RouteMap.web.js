import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';

const RouteMap = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Route preview unavailable on web</Text>
      <Text style={styles.subtitle}>Please use the mobile app for map navigation features.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200,
    borderRadius: 12,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center'
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center'
  }
});

export default RouteMap;
