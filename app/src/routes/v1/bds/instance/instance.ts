import { Router } from "express";
import { ServerConfigSchema } from "../../../../obsidian/entities/instanceConfigSchema";

const router = Router();

router.post('/create', async (req, res) => {
    try {
        const serverConfig = ServerConfigSchema.safeParse(req.body);

        if (!serverConfig.success) {
            return res.status(400).json({ status: 400, code: "bat_request", message: "インスタンスの設定項目が不足しています。" });
        }

        const result = await req.services.obsidianCore.createServer(req.body);
        if (!result.result) {
            throw new Error('Instance create Error')
        }

        res.status(200).json({ status: 200, code: "ok", message: "インスタンスの作成リクエストが許可されました。" });

    } catch(error) {
        res.status(500).json({ status: 500, code: "internal_server_error", message: "インスタンスの作成に失敗しました。" });
    }
});

export default router;