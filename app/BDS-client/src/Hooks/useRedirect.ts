import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

export const useRedirect = (path: string, delay: number = 3000) => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate(path);
        }, delay);

        return () => clearTimeout(timer);
    }, [path, delay, navigate]);
}