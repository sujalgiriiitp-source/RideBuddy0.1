import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { ChatProvider } from './src/context/ChatContext';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown app error' };
  }

  componentDidCatch(error) {
    console.error('RideBuddy App crash:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.container}>
            <Text style={styles.title}>RideBuddy</Text>
            <Text style={styles.subtitle}>App failed to render.</Text>
            <Text style={styles.meta}>{this.state.message}</Text>
            <Text style={styles.hint}>Please refresh the page or reopen the app.</Text>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    console.log('[App] RideBuddy app startup');
  }, []);

  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <NotificationProvider>
              <RootNavigator />
            </NotificationProvider>
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
      <Toast />
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    marginTop: 12,
    color: '#1E293B',
    textAlign: 'center'
  },
  meta: {
    fontSize: 14,
    marginTop: 8,
    color: '#64748B',
    textAlign: 'center'
  },
  hint: {
    fontSize: 13,
    marginTop: 12,
    color: '#64748B',
    textAlign: 'center'
  }
});
