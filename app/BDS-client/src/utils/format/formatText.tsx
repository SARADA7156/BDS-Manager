/**
 * 特殊な記号を含む文字列をReact要素に変換
 * @param {string} text
 * @returns {React.ReactNode[]}
 * **/

export const formatLabel = (text: string) => {
    if (!text) return [];

    const parts = [];
    let lastIndex = 0;

    const regex: RegExp = /\[b\](.*?)\[bE\]|\[code\](.*?)\[codeE\]|\[br\]/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        const fullMath = match[0]; // マッチ全体
        const boldText = match[1]; // キャプチャ部分
        const codeText = match[2];
        const matchIndex = match.index; // マッチ開始位置

        // マッチする前のテキストを追加
        if (matchIndex > lastIndex) {
            parts.push(text.substring(lastIndex, matchIndex));
        }

        if (fullMath === '[br]') {
            // [br]タグを<br>に変換する
            parts.push(<br key={`br-${matchIndex}`} />);
        } else if (boldText !== undefined) {
            parts.push(<strong key={`b-${matchIndex}`}>{boldText}</strong>);
        } else if (codeText !== undefined) {
            // [code]... [codeE] → <code>
            parts.push(<code key={`code-${matchIndex}`}>{codeText}</code>);
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return parts;
}