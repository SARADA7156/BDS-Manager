import { Router } from "express";

const router = Router();
import settingTabs from './api/createInstance/settingTabs';

router.use('/instance/settings', settingTabs);

export default router;