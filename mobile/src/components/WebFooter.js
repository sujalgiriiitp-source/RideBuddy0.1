import React from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const WebFooter = () => {
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.footer}>
      <View style={styles.linksRow}>
        <Link href="/legal" asChild>
          <Pressable>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Pressable>
        </Link>
        <Text style={styles.dot}>•</Text>
        <Link href="/legal" asChild>
          <Pressable>
            <Text style={styles.linkText}>Terms of Service</Text>
          </Pressable>
        </Link>
        <Text style={styles.dot}>•</Text>
        <Pressable onPress={() => Linking.openURL('mailto:sujalgiri5@gmail.com')}>
          <Text style={styles.linkText}>Contact Us</Text>
        </Pressable>
      </View>
      <Text style={styles.copyright}>© 2026 RideBuddy. All rights reserved.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    marginTop: tokens.spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: '#DCE6F8',
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
    alignItems: 'center'
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: tokens.spacing.sm,
    gap: 8
  },
  linkText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700'
  },
  dot: {
    color: colors.textTertiary,
    fontSize: 12
  },
  copyright: {
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: '600'
  }
});

export default WebFooter;
