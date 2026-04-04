import React from 'react';
import { Redirect, usePathname, Unmatched } from 'expo-router';

const legacyRedirects = {
  '/Login': '/login',
  '/Main/Home': '/main/home'
};

export default function NotFoundScreen() {
  const pathname = usePathname();

  if (legacyRedirects[pathname]) {
    return <Redirect href={legacyRedirects[pathname]} />;
  }

  const lowerPath = pathname?.toLowerCase?.() || '/';
  if (pathname && pathname !== lowerPath && lowerPath !== '/+not-found') {
    return <Redirect href={lowerPath} />;
  }

  return <Unmatched />;
}
