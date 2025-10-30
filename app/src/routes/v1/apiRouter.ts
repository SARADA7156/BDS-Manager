import { Router } from "express";

const router = Router();
import instance from './bds/instance/instance';
import sidebar from './api/ui/sidebarNav';

router.use('/sidebar', sidebar);
router.use('/instance/', instance);

export default router;