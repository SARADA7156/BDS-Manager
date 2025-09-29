import { Router } from "express";

const router = Router();

import home from './index';
import login from './login';
import v1Router from './v1/pageRouter';

router.use('/', home);
router.use('/login', login);
router.use('/v1', v1Router);

export default router;