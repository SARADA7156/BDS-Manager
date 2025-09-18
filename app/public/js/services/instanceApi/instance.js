import { httpClient } from "../api.js";

export class InstanceApi {
    async createInstance(data) {
        return httpClient.post('/instance/create', data);
    }
}