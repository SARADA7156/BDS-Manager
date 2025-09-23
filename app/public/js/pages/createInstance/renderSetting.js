import { LoadingHelper } from '../../utils/loadingHelper.js';
import { InstanceApi } from '../../services/instanceApi/instance.js';
import { RadioBtnHelper } from '../../utils/RadioBtnHelper.js';
import { TabRenderer } from './settingTabs.js';
import { SettingsRenderer } from './settings.js';
import { setupTabs } from '../../utils/tabActionHelper.js';

class InstanceSettingRenderer {
    constructor (settingWrapper, tabWrapper, TabRenderer, SettingsRenderer) {
        this.delay = 300;
        this.settingWrapper = settingWrapper;
        this.tabWrapper = tabWrapper;
        this.TabRenderer = new TabRenderer(this.tabWrapper);
        this.SettingsRenderer = new SettingsRenderer(this.settingWrapper);
    }

    async renderSettigTabs() {
        LoadingHelper.create(this.tabWrapper); // ロード画面を表示

        // 遅延をPromise化
        await new Promise(resolve => setTimeout(resolve, this.delay));

        try {
            // データを取得
            const datas = await InstanceApi.createSettingTabs();

            if (!datas) {
                throw new Error('Failed to retrieve list data.');
            }

            LoadingHelper.remove(this.tabWrapper); // ロード画面を削除

            this.TabRenderer.render(datas.tabData);

        } catch(error) {
            console.error('List generation error:', error);
            this.tabWrapper.textContent = 'データの取得に失敗しました。';
        }
    }

    async renderSettings() {
        LoadingHelper.create(this.settingWrapper); // ロード画面を表示

        await new Promise(resolve => setTimeout(resolve, this.delay));
        try {
            // データを取得
            const datas = await InstanceApi.instanceSettings();;

            if (!datas) throw new Error('Failed to retrieve list data.');

            LoadingHelper.remove(this.settingWrapper); // ロード画面を削除

            this.SettingsRenderer.render(datas.settingsData);

            document.querySelectorAll('[data-radio-group]').forEach(group => {
                new RadioBtnHelper(group);
            });

        } catch(error) {
            console.error('List generation error:', error);
            this.tabWrapper.textContent = 'データの取得に失敗しました。';
        }
    }

    async init() {
        await this.renderSettigTabs();
        await this.renderSettings();
        setupTabs(
            this.tabWrapper.querySelectorAll('.setting-tab'),
            this.settingWrapper.querySelectorAll('.setting')
        );
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const tab = document.getElementById('instance-setting-tabs');
    const setting = document.getElementById('instance-settings');
    const renderer = new InstanceSettingRenderer(setting, tab, TabRenderer, SettingsRenderer);
    renderer.init();
});