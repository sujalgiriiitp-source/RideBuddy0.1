import React from 'react';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../src/context/AuthContext';
import SignupScreen from '../src/screens/SignupScreen';

export default function SignupRoute() {
  return (
    <AuthProvider>
      <SignupScreen />
      <Toast />
    </AuthProvider>
  );
}
