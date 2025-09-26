import axios from 'axios';

const API_URL: string = import.meta.env.VITE_API_URL;

const axiosClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type' : 'application/json',
    },
});

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        switch(error.response.status) {
            case 401:
                console.error('認証エラー: トークンが無効です。');
                break;
            default:
                console.error('エラー: 予期せぬエラーが発生しました。');
        }
        return Promise.reject(error);
    }
);

export default axiosClient;