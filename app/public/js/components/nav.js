import { ClassHelper } from '../utils/classHelper.js';

window.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    const mainContainer = document.querySelector('.main-container');
    const menuBtn = document.getElementById('menuBtn');
    menuBtn.addEventListener('click', () => {
        ClassHelper.toggle(nav, 'active');
        ClassHelper.toggle(header, 'active');
        ClassHelper.toggle(mainContainer, 'nav-active')
    })
});