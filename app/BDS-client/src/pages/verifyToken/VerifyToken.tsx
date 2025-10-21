import { useSearchParams } from 'react-router-dom';
import './verifyToken.css';
import { useEffect, useState } from 'react';
import Loader from '../../components/loader/Loader';

export const VerifyToken = () => {
    const [status, setStatus] = useState<'pending' | 'error'>('pending');
    const [searchParams] = useSearchParams();
    const uuid = searchParams.get('uuid');
    const API_URL: string = import.meta.env.VITE_LOGIN_URL;

    useEffect(() => {
        if (!uuid) return;

        (async () => {
            try {
                const response = await fetch(`${API_URL}/magic-login`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uuid: uuid }),
                });

                if (!response.ok) throw new Error('認証に失敗しました。');

                const result = await response.json();
                window.location.href = result.redirectUrl;
            } catch (error) {
                setStatus('error');
                console.error('ログインエラー:', error);
            }
        })();
    }, [uuid]);

    return (
        <div className='bg-dark2 center p-3' id='verify-token-container'>
            {status === 'pending' &&
                <div>
                    <p className='text-center'>ログイン処理中です。</p>
                    <Loader/>
                </div>
            }

            {status === 'error' &&
                <div className='text-center'>
                    <h2>認証に失敗しました</h2>
                    <p>リンクの期限が切れているか、無効なリンクです。</p>
                </div>
            }
        </div>
    )
}