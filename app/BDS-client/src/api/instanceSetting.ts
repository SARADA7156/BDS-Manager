import axiosClient from "./axiosClient";

export const createInstance = async (data: Record<string, string>) => {
    try {
        const response = await axiosClient.post('/instance/create', data);
        return response.data;
    } catch (error) {
        console.error('インスタンス設定タブデータの取得に失敗しました。');
        throw error;
    }
}