import { Router } from "express";

const router = Router();
import instance from './bds/instance/instance';
import queue from './bds/queue/queue';
import sidebar from './api/ui/sidebarNav';

router.use('/sidebar', sidebar);
router.use('/instance/', instance);
router.use('/queue/', queue)

export default router;