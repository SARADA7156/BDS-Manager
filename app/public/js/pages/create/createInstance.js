import { InstanceApi } from "../../services/instanceApi/instance.js";

window.addEventListener('DOMContentLoaded', () => {
    const instanceApi = new InstanceApi();

    const form = document.getElementById('createInstanceForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // デフォルトのフォーム送信をブロック
        const instanceName = document.getElementById('instanceName').value;

        const result = await instanceApi.createInstance({ name: instanceName });
        console.log(instanceName);
    })
});