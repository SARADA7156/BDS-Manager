import { NextFunction, Request, Response } from "express"
import { Payload } from "../../types/jwt/payload";

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization']; // Authorizationヘッダーからトークンを取得

    // ヘッダーが存在し、かつ"Bearer" で始まることを確認
    const token = authHeader && authHeader.split(' ')[1];

    // 存在しない場合は401を返す
    if (!token) return res.status(401).json({ status: 401, code: "Unauthorized", message: "認証トークンが提供されていません。" });

    const user: Payload | null = req.services.jwtService.verifyToken(token, false,);

    if (!user) return res.status(403).json({ status: 403, code: "Forbidden", message: "認証トークンが無効です。" });

    // ペイロードをリクエストオブジェクトへ格納し、後続のルートハンドラーでユーザー情報にアクセスできるように
    req.user = user;

    next(); // 承認成功 次の処理へ
}