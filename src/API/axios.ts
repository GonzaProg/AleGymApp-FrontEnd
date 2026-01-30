import axios from "axios";
import { authTokenService } from "./Auth/AuthTokenService";
import { AuthApi } from "./Auth/AuthApi";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
    baseURL,
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

const onRefreshed = (newAccessToken: string) => {
    refreshSubscribers.forEach(cb => cb(newAccessToken));
    refreshSubscribers = [];
};

// REQUEST
api.interceptors.request.use((config) => {
    const token = authTokenService.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// RESPONSE
api.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            error.response?.data?.code === "TOKEN_EXPIRED" &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise(resolve => {
                    subscribeTokenRefresh((newToken) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                const refreshToken = authTokenService.getRefreshToken();
                if (!refreshToken) throw error;

                const response = await AuthApi.refresh(refreshToken);

                authTokenService.setTokens(
                    {
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken,
                        expiresIn: response.expiresIn,
                    },
                    authTokenService.getUser(),
                    !!localStorage.getItem("refreshToken")
                );

                onRefreshed(response.accessToken);
                isRefreshing = false;

                originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
                return api(originalRequest);

            } catch (err) {
                authTokenService.clearTokens();
                isRefreshing = false;
                return Promise.reject(err);
            }
        }

        if (error.response?.status === 401) {
            authTokenService.clearTokens();
        }

        return Promise.reject(error);
    }
);

export default api;
