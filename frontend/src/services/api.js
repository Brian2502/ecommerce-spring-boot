import axios from "axios";

export const AUTH_TOKEN_KEY = "uvmart_token";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    timeout: 60000,
});

export function setAuthToken(token) {
    if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
    }
}

// Tự động gắn JWT vào mỗi request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        delete config.headers.Authorization;
    }

    return config;
});

// Xử lý phiên đăng nhập không còn hợp lệ
api.interceptors.response.use(
    (response) => response,

    (error) => {
        const status = error.response?.status;
        const requestToken =
            error.config?.headers?.Authorization;

        const currentToken =
            localStorage.getItem(AUTH_TOKEN_KEY);

        if (
            status === 401 &&
            currentToken &&
            requestToken === `Bearer ${currentToken}`
        ) {
            setAuthToken(null);

            window.dispatchEvent(
                new Event("auth:expired")
            );
        }

        return Promise.reject(error);
    }
);

export default api;