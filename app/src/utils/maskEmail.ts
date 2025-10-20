// メールアドレスのローカルパート(@より前の部分)をマスキングする関数

export const maskEmail = (email: string) => {
    if (!email || typeof email !== 'string') {
        return '';
    }

    // @ の位置を探す
    const atIndex = email.indexOf('@');
    if (atIndex === -1) {
        return email; // @ が含まれていなければそのまま返す
    }

    // ローカルパート（@より前）とドメインパート（@より後）に分割
    const localPart = email.substring(0, atIndex);
    const domainPart = email.substring(atIndex);

    // ローカルパートをマスキング
    if (localPart.length <= 3) {
        // 3文字以下の場合、最初の一文字だけを表示し、残りを*で隠す
        const firstChar = localPart.charAt(0);
        const maskedLocalPart = firstChar + '*'.repeat(localPart.length - 1);
        return maskedLocalPart + domainPart;
    } else {
        // 4文字以上の場合、最初の最後の2文字ずつを表示し、間を*で隠す
        const start = localPart.substring(0, 3);
        const end = localPart.substring(atIndex - 1);
        const maskedLength = localPart.length - 3;

        const maskedLocalPart = start + '*'.repeat(maskedLength);
        return maskedLocalPart + domainPart;
    }
}