class HttpClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async get(endpoint, options = {}) {
        return this.request(endpoint, { method: "GET", ...options });
    }

    async request(endpoint, options) {
        const response = await fetch(this.baseURL + endpoint, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json().catch(() => null);
    }
}

export const httpClient = new HttpClient('/api/v1');