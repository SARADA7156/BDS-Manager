import { useCallback, useEffect, useState } from "react"

const useCountdown = (initialTime: number = 60) => {
    const [timeLeft, setTimeLeft] = useState(0);

    const isCounting = timeLeft > 0;

    // カウントダウンを開始する関数
    const startCountdown = useCallback(() => {
        setTimeLeft(initialTime);
    }, [initialTime]);

    // タイマーの副作用を処理
    useEffect(() => {
        // timeLeftが0より大きい場合のみタイマーを設定
        if (!isCounting) {
            return;
        }

        const timeId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        // クリーンアップ関数
        return () => clearInterval(timeId);
    }, [isCounting]);

    return { timeLeft, startCountdown, isCounting };
}

export default useCountdown;