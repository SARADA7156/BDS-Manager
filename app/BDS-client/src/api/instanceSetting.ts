import axiosClient from "./axiosClient";

export const fetchSettingList = async () => {
    try {
        const response = await axiosClient.get('/instance/setting/lists');
        return response.data;
    } catch (error) {
        console.error('インスタンス設定リストの取得に失敗しました。');
        throw error;
    }
}