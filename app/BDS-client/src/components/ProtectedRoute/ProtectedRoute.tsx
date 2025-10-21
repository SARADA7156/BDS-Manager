import type { JSX } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ element }: {element: JSX.Element}) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <p>承認状態を確認中です...</p>
    }

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    return element;
}