import { ClassHelper } from "../../utils/classHelper.js";

window.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.setting-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(tab => {
                ClassHelper.remove(tab, 'active');
            })
            ClassHelper.add(tab, 'active');
            const settingElements = document.querySelectorAll('.setting');
            const activeElement = `${tab.id}-settings`;
            settingElements.forEach(element => {
                if (element.id === activeElement) {
                    ClassHelper.add(element, 'active');
                } else {
                    ClassHelper.remove(element, 'active');
                }
            });
        });
    })
});