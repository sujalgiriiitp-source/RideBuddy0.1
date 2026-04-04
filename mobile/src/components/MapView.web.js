import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';

const MapView = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>Map is available on mobile app.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 180,
    borderRadius: 12,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600'
  }
});

export default MapView;
