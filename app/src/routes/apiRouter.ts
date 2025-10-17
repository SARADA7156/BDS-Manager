import { Router } from "express";

const router = Router();

import v1ApiRouter from './v1/apiRouter';
import verifyEmail from './auth/verifyEmail'

router.use('/verify-email', verifyEmail);
router.use('/v1', v1ApiRouter);

export default router;