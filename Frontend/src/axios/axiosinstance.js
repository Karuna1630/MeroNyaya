import axios from 'axios';

// Base URL for the API, can be set via environment variable or defaults to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';


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
  baseURL: API_URL,
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

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Attempt to refresh the access token
                const response = await axios.post(`${API_URL}/authentications/token/refresh/`, {
                    refresh: refreshToken,
                });

                // Store the new access token
                const newAccessToken = response.data.access;
                localStorage.setItem('access_token', newAccessToken);
                // Retry the original request with the new token
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login
               localStorage.removeItem('access_token');
               localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        // If the error is not 401 or retry already attempted, reject
        return Promise.reject(error);
    }
);

export default axiosInstance;       