import axiosClient from "./axiosClient";

export const fetchSettingList = async () => {
    try {
        const response = await axiosClient.get('/instance/setting/lists');
        return response.data.listData;
    } catch (error) {
        console.error('インスタンス設定リストの取得に失敗しました。');
        throw error;
    }
}

export const fetchSettingTabs = async () => {
    try {
        const response = await axiosClient.get('/instance/setting/tabs');
        return response.data.tabData;
    } catch (error) {
        console.error('インスタンス設定タブデータの取得に失敗しました。');
        throw error;
    }
}
