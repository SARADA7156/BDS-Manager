export async function verifyEmail(email: string) {
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
        return;
    } catch (error) {
        console.error('致命的なエラー:', error);
        throw error;
    }
}