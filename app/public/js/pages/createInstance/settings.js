import { LoadingHelper } from '../../utils/loadingHelper.js';
import { InstanceApi } from '../../services/instanceApi/instance.js';
import { Sanitize } from '../../utils/sanitize.js';
import { RadioBtnHelper } from '../../utils/RadioBtnHelper.js';

class SettingsRenderer {
    constructor(mainContainer) {
        this.mainContainer = mainContainer;
    }

    render(datas) {
        datas.forEach((data, index) => {
            const container = document.createElement('div');
            container.classList.add('p-2', 'setting');
            container.id = data.id;
            // indexが0のデータは一番最初に表示される設定なのでactiveクラスを付加
            if (index === 0) {
                container.classList.add('active');
            }

            container.appendChild(this.createHeader(data.label));
            container.appendChild(this.createSettingList(data.settings));
            this.mainContainer.appendChild(container)
        });
    }

    // ヘッダーを生成
    createHeader(title) {
        const header = document.createElement('h4');
        header.textContent = title;
        header.classList.add('border-bottom');
        return header;
    }

    createSettingList(settings) {
        const list = document.createElement('ul');
        settings.forEach(setting => {
            const listContent = document.createElement('li');

            const itemText = Sanitize.sanitizedOutput(setting.label);
            listContent.innerHTML = itemText;

            // inputのタイプによってinput要素のレンダリング方法を変更
            switch(setting.type) {
                case 'text':
                    listContent.appendChild(this.createTextInput(setting.id, setting.name, setting.required));
                    break;
                case 'radio':
                    listContent.appendChild(this.createRadioInput(setting.id, setting.name, setting.options));
                    break;
            }

            list.appendChild(listContent);
        });
        return list;
    }

    createTextInput(id, name, required) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = id;
        input.name = name;
        if (required) input.required = true;
        return input;
    }

    createRadioInput(id, name, options) {
        const radioContainer = document.createElement('div');
        radioContainer.id = id;
        radioContainer.role = 'group';
        radioContainer.classList.add('btn-group', 'mt-2');
        radioContainer.setAttribute('data-radio-group', '');

        options.forEach(option => {
            // type="radio"のinput要素を生成
            const input = document.createElement('input');
            input.type = 'radio'
            input.name = name;
            input.classList.add('btn-check');
            input.id = option.optId;
            input.value = option.value;
            input.autocomplete = 'off';

            // inputに対応したlabel要素を生成
            const label = document.createElement('label');
            label.htmlFor = option.optId;
            label.textContent = option.label;

            if (option.checked) {
                input.checked = true;
                label.classList.add('btn', 'btn-green');
            } else {
                label.classList.add('btn', 'btn-gray')
            }
            radioContainer.appendChild(input);
            radioContainer.appendChild(label);
        });
        return radioContainer;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const settingsContainer = document.getElementById('instance-settings');
    LoadingHelper.create(settingsContainer); // ロード画面を表示
    // UI/UXの都合上ディレイを実装
    setTimeout(async () => {
        try {
            // 設定項目データをすべて取得
            const datas = await InstanceApi.instanceSettings();
            // データを取得できなかった場合はエラー
            if (!datas) throw new Error('Failed to retrieve list data.');

            LoadingHelper.remove(settingsContainer); // ロード画面を削除

            const renderer = new SettingsRenderer(settingsContainer);
            renderer.render(datas.settingsData);

            document.querySelectorAll('[data-radio-group]').forEach(group => {
                new RadioBtnHelper(group);
            });

        } catch(error) {
            console.error('List generation error:', error);
            settingsContainer.textContent = '予期せぬエラーが発生しました。';
        }
    }, 300);
});