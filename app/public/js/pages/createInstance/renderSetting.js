import { LoadingHelper } from '../../utils/loadingHelper.js';
import { InstanceApi } from '../../services/instanceApi/instance.js';
import { RadioBtnHelper } from '../../utils/RadioBtnHelper.js';
import { TabRenderer } from './settingTabs.js';
import { SettingsRenderer } from './settings.js';
import { TabActionHelper } from '../../utils/tabActionHelper.js';
import { PreviewRenderer } from './renderPreview.js';

class InstanceSettingRenderer {
    constructor (form, settingWrapper, tabWrapper, TabRenderer, SettingsRenderer, PreviewRenderer) {
        this.delay = 300;
        this.form = form;
        this.settingWrapper = settingWrapper;
        this.tabWrapper = tabWrapper;
        this.TabRenderer = new TabRenderer(this.tabWrapper);
        this.SettingsRenderer = new SettingsRenderer(this.settingWrapper);
        this.PreviewRenderer = PreviewRenderer;
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
        const tabs = this.tabWrapper.querySelectorAll('.setting-tab');
        const settings = this.settingWrapper.querySelectorAll('.setting');
        TabActionHelper.setupTabs(tabs, settings);
        // form送信ボタンを押された際の処理を登録
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            // TabActionHelper.inactive(tabs, settings);
            const previewModal = document.getElementById('preview-modal-content');
            const modal = document.getElementById('preview-modal');
            const preview = new this.PreviewRenderer(settings, previewModal);
            preview.render();
            previewModal.classList.add('active');
            modal.classList.add('active');
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('createInstanceForm');
    const tab = document.getElementById('instance-setting-tabs');
    const setting = document.getElementById('instance-settings');
    const renderer = new InstanceSettingRenderer(form, setting, tab, TabRenderer, SettingsRenderer, PreviewRenderer);
    renderer.init();
});