export class LoadingHelper {
    // ロード画面を追加する関数
    static create(element) {
        if (element) {
            const loader = document.createElement('div');
            loader.classList.add('loader');
            element.appendChild(loader);
        }
    }

    // ロード画面を消す関数
    static remove(element) {
        if (element) {
            const loaders = element.querySelectorAll('.loader');
            loaders.forEach(loader => {
                loader.remove();
            });
        }
    }
}