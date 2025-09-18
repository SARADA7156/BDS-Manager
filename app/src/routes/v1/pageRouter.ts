import { Router } from "express";

const router = Router();

import dashboard from './pages/dashboard';

router.use('/dashboard', dashboard);

export default router;