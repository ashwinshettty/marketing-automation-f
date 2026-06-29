let listeners = [];
let toastId = 0;

const publish = (toast) => {
  listeners.forEach((listener) => listener(toast));
};

export const subscribeToToasts = (listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
};

export const toast = {
  success: (message) => {
    publish({ id: ++toastId, type: 'success', message });
  },
  error: (message) => {
    publish({ id: ++toastId, type: 'error', message });
  },
  info: (message) => {
    publish({ id: ++toastId, type: 'info', message });
  },
};
