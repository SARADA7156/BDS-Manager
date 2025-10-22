import React, { useState } from 'react';
import './login.css';
import { verifyEmail } from '../../api/verifyEmail';
import Loader from '../../components/loader/Loader';
import { Input } from './Input';
import { Complete } from './Complete';

const SPECIFIC_DOMAIN_REGEX = /^[a-zA-Z0-9._%+-]+@(gmail\.com|icloud\.com)$/i; // Gmail/iCloud 専用の正規表現

const Login = () => {
    const [state, setState] = useState<'input' | 'loading' | 'complete' | 'error'>('input');
    const [email, setEmail] = useState('');
    const [maskEmail, setMaskEmail] = useState('');
    const [isError, setIsError] = useState<null | string>(null);

    const validateEmail = (inputEmail: string) => {
        if (!inputEmail) {
            return;
        }

        // 正規表現でテスト
        const result = SPECIFIC_DOMAIN_REGEX.test(inputEmail);
        setIsError(result ? null : '無効なメールアドレスです。');
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setEmail(inputValue);
        validateEmail(inputValue); // 入力中にバリデーション
    }

    const handleClick = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault(); // デフォルトの動作をブロック
        if (!email) {
            setIsError('メールアドレスを入力してください。');
            return;
        }

        if (!SPECIFIC_DOMAIN_REGEX.test(email)) {
            setIsError('無効なメールアドレスです。');
            return;
        }

        setIsError(null);
        setState('loading');

        try {
            const result = await verifyEmail(email); // Emailが存在するか検証し送信しマスキングされたメールアドレスを格納
            setMaskEmail(result);

            setTimeout(() => {
                setState('complete');
            }, 2000);
        } catch(error) {
            setState('error');
            console.error('メールアドレスの送信に失敗しました。');
        }
        
    }

    const handleResendClick = () => {
        verifyEmail(email);
    }

    return (
        <div className='bg-dark center p-3' id='login-container'>
            {state === 'input' &&
                <Input isError={isError} handleChange={handleChange} handleClick={handleClick} />
            }

            {state === 'loading' &&
                <Loader/>
            }

            {state === 'complete' &&
                <Complete maskEmail={maskEmail} handleResendClick={handleResendClick} />
            }

            {state === 'error' &&
                <div className='text-center'>
                    <h2>メールアドレスの送信に失敗しました。</h2>
                    <p>もう一度送信するか時間をおいてから再度送信してください。</p>
                </div>
            }
        </div>
    )
}

export default Login;