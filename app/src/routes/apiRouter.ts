import { Router } from "express";

const router = Router();

import v1ApiRouter from './v1/apiRouter';
import loginHander from './auth/loginHander'

router.use('/auth/login/', loginHander);
router.use('/v1', v1ApiRouter);

export default router;