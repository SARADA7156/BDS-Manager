import { LoadingHelper } from '../../utils/loadingHelper.js';
import { InstanceApi } from '../../services/instanceApi/instance.js';
import { Sanitize } from '../../utils/sanitize.js';
import { RadioBtnHelper } from '../../utils/RadioBtnHelper.js';

export class SettingsRenderer {
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

    createInput(id, name, type) {
        const input = document.createElement('input');
        input.id = id;
        input.name = name;
        input.type = type;
        return input;
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
                    listContent.appendChild(this.createTextInput(setting.id, setting.name, setting.type, setting.required));
                    break;
                case 'radio':
                    listContent.appendChild(this.createRadioInput(setting.id, setting.name, setting.type, setting.options));
                    break;
                case 'number':
                    listContent.appendChild(this.createNumberInput(setting.id, setting.name, setting.type, setting.required, setting.options[0]));
                    break;
                case 'range':
                    listContent.appendChild(this.createRangeInput(setting.id, setting.name, setting.type, setting.options[0]));
                    break;
                case 'switch':
                    listContent.appendChild(this.createSwitchInput(setting.id, setting.name, setting.type, setting.options[0]));
                    break;
            }

            list.appendChild(listContent);
        });
        return list;
    }

    createTextInput(id, name, type, required) {
        const input = this.createInput(id, name, type);
        if (required) input.required = true;
        return input;
    }

    createNumberInput(id, name, type, required, options) {
        const container = document.createElement('div');
        container.id = id;

        // type="number"のinput要素を生成
        const input = this.createInput(options.optId, name, type);
        if (required) input.required = true;
        if (options.value) input.value = options.value;
        if (options.min) input.min = options.min;
        if (options.max) input.max = options.max;
        container.appendChild(input);

        if (options.label) {
            // labelを生成
            const label = document.createElement('label');
            label.htmlFor = options.optId;
            label.textContent = options.label;
            label.classList.add('ms-1')
            container.appendChild(label);
        }
        return container;
    }

    createRadioInput(id, name, type, options) {
        const radioContainer = document.createElement('div');
        radioContainer.id = id;
        radioContainer.role = 'group';
        radioContainer.classList.add('btn-group', 'mt-2');
        radioContainer.setAttribute('data-radio-group', '');

        options.forEach(option => {
            // type="radio"のinput要素を生成
            const input = this.createInput(option.optId, name, type);
            input.classList.add('btn-check');
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

    createRangeInput(id, name, type, options) {
        const input = this.createInput(id, name, type);
        input.min = options.min;
        input.max = options.max;
        input.value = options.value;
        input.classList.add('form-range');
        return input;
    }

    createSwitchInput(id, name, type, options) {
        const container = document.createElement('div');
        container.id = id;
        container.classList.add('form-check', 'form-switch');

        // type="checkbox"をbootstrapでスイッチ化
        const input = this.createInput(options.optId, name, 'checkbox');
        input.role = type;
        input.classList.add('form-check-input');
        if (options.checked) input.checked = true;
        container.appendChild(input);

        return container;
    }
}