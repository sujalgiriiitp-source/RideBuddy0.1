import React, { useEffect, useMemo, useState } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { ChatProvider } from './src/context/ChatContext';

const WEB_BOOT_STEPS = ['minimal', 'theme', 'auth', 'chat', 'notification', 'ready'];

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

class ProviderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown provider error' };
  }

  componentDidCatch(error) {
    console.error(`[App][ProviderCrash] ${this.props.name}:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.container}>
            <Text style={styles.title}>RideBuddy</Text>
            <Text style={styles.subtitle}>Provider failed: {this.props.name}</Text>
            <Text style={styles.meta}>{this.state.message}</Text>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const BootScreen = ({ step }) => (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="dark-content" />
    <View style={styles.container}>
      <Text style={styles.title}>RideBuddy</Text>
      <Text style={styles.subtitle}>Booting app…</Text>
      <Text style={styles.meta}>Current step: {step}</Text>
    </View>
  </SafeAreaView>
);

export default function App() {
  const [webBootStepIndex, setWebBootStepIndex] = useState(Platform.OS === 'web' ? 0 : WEB_BOOT_STEPS.length - 1);

  useEffect(() => {
    console.log('[App] RideBuddy app startup');
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    console.log('[App][Boot] web staged startup enabled');

    if (webBootStepIndex >= WEB_BOOT_STEPS.length - 1) {
      return;
    }

    const nextStepTimer = setTimeout(() => {
      const next = webBootStepIndex + 1;
      console.log('[App][Boot] advancing to', WEB_BOOT_STEPS[next]);
      setWebBootStepIndex(next);
    }, 120);

    return () => clearTimeout(nextStepTimer);
  }, [webBootStepIndex]);

  const currentStep = WEB_BOOT_STEPS[webBootStepIndex];
  const isReady = currentStep === 'ready';

  const appContent = useMemo(() => {
    const innerContent = isReady ? <RootNavigator /> : <BootScreen step={currentStep} />;

    let wrapped = innerContent;

    if (Platform.OS !== 'web' || webBootStepIndex >= 1) {
      wrapped = (
        <ProviderErrorBoundary name="ThemeProvider">
          <ThemeProvider>{wrapped}</ThemeProvider>
        </ProviderErrorBoundary>
      );
    }

    if (Platform.OS !== 'web' || webBootStepIndex >= 2) {
      wrapped = (
        <ProviderErrorBoundary name="AuthProvider">
          <AuthProvider>{wrapped}</AuthProvider>
        </ProviderErrorBoundary>
      );
    }

    if (Platform.OS !== 'web' || webBootStepIndex >= 3) {
      wrapped = (
        <ProviderErrorBoundary name="ChatProvider">
          <ChatProvider>{wrapped}</ChatProvider>
        </ProviderErrorBoundary>
      );
    }

    if (Platform.OS !== 'web' || webBootStepIndex >= 4) {
      wrapped = (
        <ProviderErrorBoundary name="NotificationProvider">
          <NotificationProvider>{wrapped}</NotificationProvider>
        </ProviderErrorBoundary>
      );
    }

    return wrapped;
  }, [currentStep, isReady, webBootStepIndex]);

  return (
    <AppErrorBoundary>
      {appContent}
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
