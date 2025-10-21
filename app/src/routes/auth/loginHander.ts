import { Router } from "express";
import { maskEmail } from "../../utils/maskEmail";
import { logger } from "../../services/log/logger";
import { isEmail } from "../../utils/validateEmail";

const router = Router();

type Email = {
    email: string;
}

router.post('/magic-login', async (req, res) => {
    try {
        const { uuid } = req.body;

        // パラメーターが存在するかを確認
        if (typeof uuid !== 'string') {
            return res.status(400).json({ status: 400, code: 'bad_request', message: 'uuidがパラメーターに存在しないか無効な形式' });
        }

        const record = await req.services.uuidManager.validate(uuid); // 返り値としてfalseかstring型が返ってくる。

        // falseが返ってきたらuuidが無効と判断
        if (!record) {
            return res.status(400).json({ status: 400, code: 'bad_request', message: 'リンクが無効または期限切れです。' });
        }

        // jwtを発行
        const user = await req.services.userService.findUser(record);

        if (!user) throw new Error('Database find error. The user does not exist.')

        const jwt = req.services.jwtService.signRefreshJwt({ userId: user.id, userName: user.name, permission: user.permission });

        // cookieにセットしてリダイレクト
        res.cookie('auth_token', jwt, { httpOnly: true });
        res.status(200).json({ redirectUrl: '/dashboard' });

    } catch (error) {
        res.status(500).json({ status: 500, code: "internal_server_error", message: "サーバー側で予期せぬエラーが発生しました。" });
        console.error('internal server error:', error);
    }
});

router.post('/request', async (req, res) => {
    try {
        const user = req.services.userService;
        const token = req.services.uuidManager;
        const gmailService = req.services.gmailService;

        const { email } = req.body as Email;
        logger.info(`Email Verification Request: ${email}`);

        // email形式でないものは400を返す。
        if (!isEmail(email)) {
            logger.warn(`This is not a valid email address format: ${email}`);
            return res.status(400).json({ status: 400, code: 'bad_request', message: '無効な形式のメールアドレス' });
        }

        const maskedEmail: string = maskEmail(email); // 送信されたメールアドレスをマスキング
        const result = await user.findUser(email);

        if (result) {
            // メールアドレスが存在する場合のみメールを送信する。
            const uuid = await token.generate(email);
            await gmailService.sendLogin(result.email, uuid);
        }

        res.status(200).json({ maskedEmail: maskedEmail });
    } catch (error) {
        res.status(500).json({ status: 500, code: "internal_server_error", message: "サーバー側で予期せぬエラーが発生しました。" });
        logger.error('internal server error:', error);
    }
});

export default router;