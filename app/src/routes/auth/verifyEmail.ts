import { Router } from "express";

const router = Router();

router.post('/', (req, res) => {
    try {
        console.log(req.body);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ status: 500, code: "internal_server_error", message: "サーバー側で予期せぬエラーが発生しました。" });
        console.error('サーバーレスポンスエラー:', error);
    }
});

export default router;