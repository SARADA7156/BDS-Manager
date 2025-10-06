import { Router } from "express";

const router = Router();

router.post('/create', (req, res) => {
    console.log(req.body);
    res.status(200).json({ code: 200, message: 'インスタンス作成のリクエストを受理しました。' });
});

export default router;