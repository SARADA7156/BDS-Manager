import { ClassHelper } from '../../utils/classHelper.js';

export class TabRenderer {
    constructor(tabWrapper) {
        this.tabWrapper = tabWrapper;
    }

    render(datas) {
        datas.forEach(data => {
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
            this.tabWrapper.appendChild(list);
        });
    }
}