import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import tokens from '../theme/tokens';
import { useTheme } from '../context/ThemeContext';

const ScreenContainer = ({
  children,
  scroll = true,
  refreshControl,
  contentContainerStyle,
  style,
  keyboardShouldPersistTaps = 'handled'
}) => {
  const Wrapper = scroll ? ScrollView : View;
  const { isDarkMode, theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={
          isDarkMode
            ? ['#0F172A', '#1E1B4B']
            : [colors.background, colors.backgroundAlt]
        }
        style={styles.gradient}
      >
        <Wrapper
          style={[styles.container, style]}
          contentContainerStyle={scroll ? [styles.content, contentContainerStyle] : undefined}
          refreshControl={scroll ? refreshControl : undefined}
          showsVerticalScrollIndicator={scroll ? false : undefined}
          keyboardShouldPersistTaps={scroll ? keyboardShouldPersistTaps : undefined}
          nestedScrollEnabled={scroll ? true : undefined}
        >
          {children}
        </Wrapper>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  gradient: {
    flex: 1
  },
  container: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: tokens.spacing.md,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing['2xl'] || tokens.spacing.xl
  }
});

export default ScreenContainer;
