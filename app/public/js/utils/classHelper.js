export class ClassHelper {
    static add (element, className) {
        if (element && className) {
            element.classList.add(className);
        }
    }

    static remove(element, className) {
        if (element && className) {
            element.classList.remove(className);
        }
    }

    static toggle(element, className) {
        if (element && className) {
            element.classList.toggle(className);
        }
    }
}