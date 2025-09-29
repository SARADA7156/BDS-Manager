export class TabRenderer {
    constructor(tabWrapper) {
        this.tabWrapper = tabWrapper;
    }

    render(datas) {
        datas.forEach(data => {
            const list = document.createElement('li');
            list.classList.add('setting-tab');
            list.classList.add('d-flex');
            if (data.active) {
                list.classList.add('active');
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