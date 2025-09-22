import { ClassHelper } from '../../utils/classHelper.js';
import { InstanceApi } from '../../services/instanceApi/instance.js';
import { LoadingHelper } from '../../utils/loadingHelper.js';

window.addEventListener('DOMContentLoaded', () => {
    const settingTabs = document.getElementById('instance-setting-tabs');
    LoadingHelper.create(settingTabs); // ロード画面を追加
    setTimeout(async () => {
        try {
            // データを取得
            const datas = await InstanceApi.createSettingTabs();

            if (!datas) {
                throw new Error('Failed to retrieve list data.');
            }

            LoadingHelper.remove(settingTabs); // ロード画面を削除
            datas.tabData.forEach(data => {
                const list = document.createElement('li');
                ClassHelper.add(list, 'setting-tab');
                ClassHelper.add(list, 'd-flex');
                if (data.active) {
                    ClassHelper.add(list, 'active');
                }

                list.id = data.id; // idを追加
                // テキストを追加
                const text = document.createElement('p');
                text.textContent = data.text;
                list.appendChild(text);
                settingTabs.appendChild(list);
            });
        } catch(error) {
            console.error('List generation error:', error);
            settingTabs.textContent = 'データの取得に失敗しました。';
        }
    }, 300);
});