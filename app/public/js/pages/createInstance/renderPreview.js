export class PreviewRenderer {
    constructor(settings, element) {
        this.settings = settings;
        this.element = element;
        this.instanceData = {};
    }

    render() {
        const preview = this.element.querySelector('.preview');
        if (preview) {
            preview.remove();
        }
        const warapper = document.createElement('div'); // プレビューを格納する全体のコンテナ
        warapper.classList.add('p-2', 'preview', 'active');
        warapper.id = 'preview'

        // 各設定ごとにプレビューを作成し格納
        this.settings.forEach(setting => {
            const container = document.createElement('div');
            const header = document.createElement('h4');
            header.textContent = setting.querySelector('h4')?.innerHTML ?? '';
            header.classList.add('border-bottom');
            container.appendChild(header);

            const ul = document.createElement('ul'); // リスト形式で作成
            container.appendChild(ul);

            const lists = setting.querySelectorAll('li'); // 設定要素のすべてのli要素を取得

            lists.forEach(li => {
                const label = li.querySelector('b')?.innerHTML ?? '';
                const inputs = li.querySelectorAll('input');
                let result = '';

                // input要素のtypeによってinput要素の数が違うため処理を分岐させる
                if (inputs.length === 1 && inputs[0].type !== 'checkbox' && inputs[0].type !== 'radio') {
                    const input = inputs[0];
                    const value = input.value !== '' ? input.value : null;

                    result += `${label} ${value ?? '設定しない'}`;
                    // サーバー送信用に保存
                    this.instanceData[input.name] = value;
                } else {
                    const checked = Array.from(inputs).filter((input) => input.checked);

                    if (inputs[0].type === 'checkbox') {
                        const values = checked.map((input) => input.value);
                        result += `${label} ${values.length > 0 ? '有効' : '無効'}`;
                        // サーバー送信用に保存
                        this.instanceData[inputs[0].name] = values[0]? true : false;
                    } else if (inputs[0].type === 'radio') {
                        const selected = checked[0]?.value ?? '';
                        result += `${label} ${selected}`;
                        this.instanceData[inputs[0].name] = selected;
                    }
                }

                const list = document.createElement('li');
                list.innerHTML = result;
                ul.appendChild(list);
            });
            warapper.appendChild(container);
        });
        this.element.appendChild(warapper);
        console.log(this.instanceData)
    }
}