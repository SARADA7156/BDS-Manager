import useCountdown from "../../Hooks/useCountdown";

type CompleteProps = {
    maskEmail: string;
    handleResendClick: () => void;
}

const COOL_DOWN_SECONDS = 30;

export const Complete = ({ maskEmail, handleResendClick }: CompleteProps) => {
    const { timeLeft, startCountdown, isCounting } = useCountdown(COOL_DOWN_SECONDS);
    const handleClick = () => {
        handleResendClick();

        startCountdown();
    }

    const buttonText = isCounting ? `再送信 (${timeLeft}秒後)` : '再送信';
    const isDisabled = isCounting;

    return (
        <div className='text-center'>
            <h2 >あともう少しです！</h2>
            <div className='p-2'>
                <p>{maskEmail}にログイン用のリンクを送信しました。リンクをクリックしてログインしてください。<br/>※リンクは15分間有効です。</p>

                <h5 className='mt-4'>メールが届きませんか?</h5>
                <p>迷惑メールBOXを確認するか、再送信ボタンを押してください。</p>
                <button
                    disabled={isDisabled}
                    className={`btn mt-3 ${isDisabled ? 'no-active' : ''}`}
                    onClick={handleClick}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    )
}