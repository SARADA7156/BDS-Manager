import { Session, SessionData } from "express-session";
import { logger } from "../log/logger";

// セッションを管理する一連のクラス
export class SessionService {
    private developmentMode: boolean;
    constructor(private session: Session & Partial<SessionData>, developmentMode: boolean) {
        this.developmentMode = developmentMode;
    }

    setUser(userName: string) {
        this.session.LoggedInUser = userName;
    }

    getUserName(): string | undefined {
        return this.session.LoggedInUser as string | undefined;
    }

    isLoggedIn(): boolean {
        if (this.developmentMode) {
            return true;
        } else {
            return Boolean(this.session.LoggedInUser);
        }
    }

    clear() {
        this.session.destroy((err) => {
            if (err) logger.error('Session destroy failed:', err);
        });
    }
}