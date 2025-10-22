import axios from 'axios';

const API_URL: string = import.meta.env.VITE_API_URL;
const LOGIN_URL: string = import.meta.env.VITE_LOGIN_URL;

let accessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
}

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
}

const axiosClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type' : 'application/json',
    },
    withCredentials: true,
});

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

axiosClient.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(axiosClient(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await fetch(`${LOGIN_URL}/refresh`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) throw new Error('リフレッシュが失敗しました。');

                const data = await response.json();
                const newToken = data.accessToken;
                accessToken = newToken;
                onRefreshed(newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosClient(originalRequest);
            } catch(err) {
                console.log('リフレッシュトークンが無効です。再ログインが必要です。');
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;