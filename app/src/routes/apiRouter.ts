import { Router } from "express";

const router = Router();

import v1ApiRouter from './v1/apiRouter';
import loginHander from './auth/loginHander'
import { authenticateToken } from "../services/auth/authMiddleware";

router.use('/auth/login/', loginHander);
router.use('/v1', authenticateToken , v1ApiRouter);

export default router;