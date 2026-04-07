import axios from 'axios';
import { API_BASE_URL } from '../utils/runtimeConfig';

// Flag to prevent multiple concurrent refresh attempts
let isRefreshing = false;
let refreshSubscribers = [];

// Callback function for when token refresh completes
const onRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Add subscriber for token refresh
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// creating fucntion to get access token from local storage
const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

// creating function to get refresh token from local storage
const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};


// Creating reusable axios instance with base URL and default headers. 
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
  // setting default headers for JSON content type data 
  headers: {
    'Content-Type': 'application/json',
  },
  // allowing to send and receive cookies with requests, which is important for authentication and session management.
  withCredentials: true,
});

// Request interceptor to add the access token to headers which runs before every api request
axiosInstance.interceptors.request.use(
    (config) => {
        // Adding the access token to the Authorization header if it exists
        const token = getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // If sending FormData, remove Content-Type header to let axios set it with proper boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        // Returning the modified config to proceed with the request
        return config;
    },
    // Handling request errors
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor created for handling 401 errors and refresh token logic which runs after every api response
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;  

        // Check for 401 Unauthorized and prevent infinite retry loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't retry refresh token endpoint itself
            if (originalRequest.url?.includes('/authentications/token/refresh/')) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve) => {
                    addRefreshSubscriber((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        resolve(axiosInstance(originalRequest));
                    });
                });
            }

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Set refreshing flag to prevent concurrent refresh attempts
                isRefreshing = true;

                // Attempt to refresh the access token using axios directly to avoid infinite loops
                const response = await axios.post(`${API_BASE_URL}/authentications/token/refresh/`, {
                    refresh: refreshToken,
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Support both plain SimpleJWT response and wrapped API response shapes
                const payload = response.data?.Result || response.data || {};
                const newAccessToken = payload.access || payload.access_token;
                const newRefreshToken = payload.refresh || payload.refresh_token;

                if (!newAccessToken) {
                    throw new Error('Refresh endpoint did not return an access token');
                }

                // Store newly issued tokens. Refresh token may rotate on each refresh.
                localStorage.setItem('access_token', newAccessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refresh_token', newRefreshToken);
                }

                // Flag refresh as complete and notify all queued requests
                isRefreshing = false;
                onRefreshed(newAccessToken);

                // Retry the original request with the new token
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // If refresh fails, clear tokens and redirect to login
                isRefreshing = false;
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                
                console.error('Token refresh failed:', refreshError.response?.status, refreshError.response?.data);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        // If the error is not 401 or retry already attempted, reject
        return Promise.reject(error);
    }
);

export default axiosInstance;       