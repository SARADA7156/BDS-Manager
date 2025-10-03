// 汎用バリデーション関数
export const isValid = (data: string, regex: RegExp): boolean => {
    if (typeof data !== 'string' || !(regex instanceof RegExp)) {
        // 予期しない引数の場合はfalseを返す
        console.error('isValid関数: 引数が無効');
        return false;
    }
    return regex.test(data);
}

// 必須項目チェック
export const isRequired = (data: string): boolean => {
    return data.trim().length === 0;
}