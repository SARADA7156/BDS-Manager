/**
 * ISO 8601形式の日付文字列を 'yyyy-mm-dd-時-分-秒' 形式に変換
 * @param {Date | string} isoString - 変換したいISO 8601形式の文字列 (例: '2025-11-27T02:25:50.130Z')
 * @returns {string} - 変換後の文字列 (例: '2025-11-27-02-25-50')
 */

export function formatIsoData(isoString: Date | string): string {
    const date = new Date(isoString);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDay();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    const pad = (num: number) => String(num).padStart(2, '0');

    return `${year}年${pad(month)}月${pad(day)}日 ${pad(hour)}時${pad(minute)}分${pad(second)}秒`;
}