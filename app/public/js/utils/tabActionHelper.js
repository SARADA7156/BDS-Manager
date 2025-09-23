import { ClassHelper } from "./classHelper.js"

export function setupTabs(buttons, tabs, options = {}) {
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