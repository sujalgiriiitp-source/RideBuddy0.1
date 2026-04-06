import React from 'react';
import { Redirect } from 'expo-router';

export default function PrivacyPolicyRedirectRoute() {
  return <Redirect href="/legal" />;
}
