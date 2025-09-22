import { httpClient } from "../api.js";

export class InstanceApi {
    static async createInstance(data) {
        return httpClient.post('/instance/create', data);
    }

    static async createSettingTabs() {
        return httpClient.get('/instance/settings/tabs');
    }

    static async instanceSettings() {
        return httpClient.get('/instance/settings/');
    }
}