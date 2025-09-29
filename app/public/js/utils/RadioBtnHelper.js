import { ClassHelper } from './classHelper.js';

export class RadioBtnHelper {
    constructor(groupElement) {
        this.group = groupElement;
        this.radios = this.group.querySelectorAll('.btn-check');
        this.labels = this.group.querySelectorAll('label');

        this.init();
    }

    init () {
        // 初期状態を反映
        this.update();

        // 変更イベントを監視
        this.radios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.update();
            });
        });
    }

    update() {
        // すべて未選択に戻す
        this.labels.forEach(label => {
            ClassHelper.remove(label, 'btn-green');
            ClassHelper.add(label, 'btn-gray');
        });

        // 選択中の物を緑に
        this.radios.forEach(radio => {
            if (radio.checked) {
                const label = this.group.querySelector(`label[for="${radio.id}"]`);
                ClassHelper.remove(label, 'btn-gray');
                ClassHelper.add(label, 'btn-green');
            }
        });
    }
}