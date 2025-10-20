import { Router } from "express";
import { maskEmail } from "../../utils/maskEmail";
import { logger } from "../../services/log/logger";
import { isEmail } from "../../utils/validateEmail";

const router = Router();

type Email = {
    email: string;
}

router.post('/', async (req, res) => {
    try {
        const user = req.services.userService;

        const gmailMailer = req.services.gmailMailer;

        const { email } = req.body as Email;
        logger.info(`Email Verification Request: ${email}`);

        if (!isEmail(email)) {
            logger.warn(`This is not a valid email address format: $${email}`);
            res.status(400).json({ status: 400, code: 'bad_request', message: '無効な形式のメールアドレス' });
        }

        const result = await user.findUser(email);
        if (result) {
            try {
                gmailMailer.send('tsskyeprosabu@gmail.com', 'テストメール', 'typescriptアプリケーションから自動で送信しています。');
            } catch (error) {
                logger.error(`mail send error: ${error}`);
            }
        }
        console.log(result);

        const maskedEmail: string = maskEmail(email); // 送信されたメールアドレスをマスキング

        res.status(200).json({ maskedEmail: maskedEmail });
    } catch (error) {
        res.status(500).json({ status: 500, code: "internal_server_error", message: "サーバー側で予期せぬエラーが発生しました。" });
        logger.error('internal server error:', error);
    }
});

export default router;