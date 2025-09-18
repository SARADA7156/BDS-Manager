class HttpClient {
    instance;

    constructor(baseURL) {
        this.instance = axios.create({ baseURL });
    }

    get(url, params) {
        return this.instance.get(url, { params });
    }

    post(url, data) {
        return this.instance.post(url, data);
    }
}

export const httpClient = new HttpClient('/api/v1');