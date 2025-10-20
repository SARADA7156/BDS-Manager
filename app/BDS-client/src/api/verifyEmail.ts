type VerifyResponse = {
    maskedEmail: string;
}

export async function verifyEmail(email: string): Promise<string> {
    const API_URL: string = import.meta.env.VITE_LOGIN_URL;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email }),
        });

        if (!response.ok) {
            throw new Error('リクエストの送信に失敗しました。');
        }

        const resData: VerifyResponse = await response.json();

        return resData.maskedEmail;
    } catch (error) {
        console.error('致命的なエラー:', error);
        throw error;
    }
}