export const toRegExp = (pattern: string): RegExp => {
    const map: Record<string, RegExp> = {
        str: /^[a-zA-Z-]*$/,
        num: /^[0-9]*$/
    };
    return map[pattern] ?? undefined;
}