import { Router } from "express";

const router = Router();

import home from './pages/index';
import login from './pages/login';

router.use('/', home);
router.use('/login', login);

export default router;