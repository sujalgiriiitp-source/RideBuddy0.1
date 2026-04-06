import { useEffect } from 'react';
import { Platform } from 'react-native';

const PwaRegistrar = () => {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (_error) {
      }
    };

    registerServiceWorker();
  }, []);

  return null;
};

export default PwaRegistrar;
