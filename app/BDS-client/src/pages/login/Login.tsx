import React, { useState } from 'react';
import { EmailInput } from '../../components/Inputs/EmailInput';
import './login.css';
import { verifyEmail } from '../../api/verifyEmail';
import Loader from '../../components/loader/Loader';

const SPECIFIC_DOMAIN_REGEX = /^[a-zA-Z0-9._%+-]+@(gmail\.com|icloud\.com)$/i; // Gmail/iCloud 専用の正規表現

const Login = () => {
    const [state, setState] = useState<'input' | 'loading' | 'complete' | 'error'>('input');
    const [email, setEmail] = useState('');
    const [maskEmail, setMaskEmail] = useState('');
    const [isValid, setIsValid] = useState<null | boolean>(null);
    const [isError, setIsError] = useState<null | string>(null);

    const validateEmail = (inputEmail: string) => {
        if (!inputEmail) {
            setIsValid(null);
            return;
        }

        // 正規表現でテスト
        const result = SPECIFIC_DOMAIN_REGEX.test(inputEmail);
        setIsValid(result);
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
        <div className='bg-dark2 center p-3' id='login-container'>
            {state === 'input' &&
                <div>
                    <h2 className='text-center'>サインイン</h2>
                    <form className='bg-dark2 p-2 d-grid'>
                        <EmailInput onChange={handleChange} isError={isError}/>
                        <button className={`btn box-border mt-3 ${isValid ? 'active' : 'no-active'}`} onClick={handleClick}>サインイン</button>
                    </form>
                </div>
            }

            {state === 'loading' &&
                <Loader/>
            }

            {state === 'complete' &&
                <div className='text-center'>
                    <h2 >あともう少しです！</h2>
                    <div className='bg-dark2 p-2'>
                        <p>{maskEmail}にログイン用のリンクを送信しました。</p>

                        <h5 className='mt-4'>メールが届きませんか?</h5>
                        <p>迷惑メールBOXを確認するか再送信ボタンを押してください。</p>
                        <button className='btn box-border mt-3' onClick={handleResendClick}>再送信</button>
                    </div>
                </div>
            }
        </div>
    )
}

export default Login;