const normalizeParam = (value) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const buildHref = (name, params = {}) => {
  switch (name) {
    case 'Login':
      return '/login';
    case 'Signup':
      return '/signup';
    case 'Main':
    case 'Home':
      return '/(tabs)/home';
    case 'Create Ride':
      return '/(tabs)/create';
    case 'Chat':
      return '/(tabs)/chat';
    case 'Intent':
      return '/(tabs)/intent';
    case 'Profile':
      return '/(tabs)/profile';
    case 'Notifications':
      return '/notifications';
    case 'Ride Details': {
      const rideId = normalizeParam(params?.rideId);
      if (!rideId) {
        return '/(tabs)/home';
      }
      return {
        pathname: '/ride/[rideId]',
        params: { rideId: String(rideId) }
      };
    }
    case 'ChatScreen': {
      const conversationId = normalizeParam(params?.conversationId);
      if (!conversationId) {
        return '/(tabs)/chat';
      }
      return {
        pathname: '/(tabs)/chat',
        params: {
          conversationId: String(conversationId),
          rideId: normalizeParam(params?.rideId) ? String(normalizeParam(params?.rideId)) : undefined,
          rideName: normalizeParam(params?.rideName) ? String(normalizeParam(params?.rideName)) : undefined
        }
      };
    }
    default:
      return null;
  }
};

export const createLegacyNavigation = (router) => ({
  navigate: (name, params) => {
    const href = buildHref(name, params);
    if (href) {
      router.push(href);
    }
  },
  replace: (name, params) => {
    const href = buildHref(name, params);
    if (href) {
      router.replace(href);
    }
  },
  goBack: () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/home');
  },
  setOptions: () => {}
});
