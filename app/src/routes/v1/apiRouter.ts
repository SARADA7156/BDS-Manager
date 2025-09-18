import { Router } from "express";

const router = Router();
import instanceHandler from './api/instance';

router.use('/instance', instanceHandler);

export default router;