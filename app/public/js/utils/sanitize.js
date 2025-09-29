export class Sanitize {
    static sanitizedOutput(text) {
        // 特定の文字をHTMLタグに変換する
        const tagMap = {
        '[br]': '<br>',
        '[br2]': '<br><br>',
        '[ul]': '<ul>',
        '[ulE]': '</ul>',
        '[li]': '<li>',
        '[liE]': '</li>',
        '[b]': '<b>',
        '[bE]': '</b>',
        '[code]': '<code>',
        '[codeE]': '</code>'
        };

        const pattern = new RegExp(Object.keys(tagMap).map(k => k.replace(/[[\]]/g, '\\$&')).join('|'), 'g');

        return text.replace(pattern, match => tagMap[match]);
    }
}