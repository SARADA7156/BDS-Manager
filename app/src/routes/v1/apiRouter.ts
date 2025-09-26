import { Router } from "express";

const router = Router();
import create from './api/createInstance/instance';
import settingTabs from './api/createInstance/settingTabs';
import sidebar from './api/ui/sidebarNav';

router.use('/sidebar', sidebar);
router.use('/instance/settings', settingTabs);
router.use('/instance/create', create);

export default router;