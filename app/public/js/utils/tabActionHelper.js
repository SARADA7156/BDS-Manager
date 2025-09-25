import { ClassHelper } from "./classHelper.js";

export class TabActionHelper {
    static setupTabs(buttons, tabs, options = {}) {
        buttons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => ClassHelper.remove(b, 'active'));
                tabs.forEach(t => ClassHelper.remove(t, 'active'));

                ClassHelper.add(btn, 'active');
                ClassHelper.add(tabs[index], 'active');

                if (options.onSwitch) {
                    options.onSwitch(index, btn, tabs[index]);
                }
            });
        });
    }

    static inactive(buttons, tabs) {
        buttons.forEach(btn => {
            ClassHelper.remove(btn, 'active');
            tabs.forEach(t => ClassHelper.remove(t, 'active'));
        })
    }
}
