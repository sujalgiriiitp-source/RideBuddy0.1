import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import colors from '../theme/colors';

const ScreenContainer = ({ children, scroll = true, refreshControl }) => {
  const Wrapper = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safe}>
      <Wrapper
        style={styles.container}
        contentContainerStyle={scroll ? styles.content : undefined}
        refreshControl={scroll ? refreshControl : undefined}
      >
        {children}
      </Wrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 24
  }
});

export default ScreenContainer;
