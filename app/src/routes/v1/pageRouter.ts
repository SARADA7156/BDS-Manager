import { Router } from "express";

const router = Router();

import dashboard from './pages/dashboard';
import instance from './pages/createInstance';

router.use('/dashboard', dashboard);
router.use('/createInstance', instance);

export default router;