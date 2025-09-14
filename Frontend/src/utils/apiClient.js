// API client utility for handling authenticated requests
const API_BASE_URL = 'http://localhost:8000/api';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const apiFetch = async (endpoint, options = {}, isRetry = false) => {
  const token = localStorage.getItem('token');

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (response.status === 401 && !isRetry) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    if (errorData.message === 'Token expired, please login again') {
      // Token expired, try to refresh
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('token', refreshData.token);
            processQueue(null, refreshData.token);
            // Retry the original request with new token
            return apiFetch(endpoint, options, true);
          } else {
            processQueue(new Error('Refresh failed'), null);
            localStorage.removeItem('token');
            throw new Error('Session expired, please login again');
          }
        } catch (error) {
          processQueue(error, null);
          localStorage.removeItem('token');
          throw new Error('Session expired, please login again');
        } finally {
          isRefreshing = false;
        }
      } else {
        // If refreshing, wait for it
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return apiFetch(endpoint, options, true);
        });
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};
