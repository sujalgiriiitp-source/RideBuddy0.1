let pendingCount = 0;
let isOffline = false;
const listeners = new Set();

const notify = () => {
  const snapshot = {
    pendingCount,
    isOffline
  };

  listeners.forEach((listener) => {
    listener(snapshot);
  });
};

export const beginApiRequest = () => {
  pendingCount += 1;
  notify();
};

export const endApiRequest = () => {
  pendingCount = Math.max(0, pendingCount - 1);
  notify();
};

export const setApiOffline = (nextOffline) => {
  const normalized = Boolean(nextOffline);
  if (normalized === isOffline) {
    return;
  }

  isOffline = normalized;
  notify();
};

export const subscribeApiActivity = (listener) => {
  listeners.add(listener);
  listener({ pendingCount, isOffline });

  return () => {
    listeners.delete(listener);
  };
};
