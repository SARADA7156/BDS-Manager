import { Router } from "express";
import { logger } from "../../../../services/log/logger";
import bedrockJson from "../../../../config/bedrock.json";

const router = Router();

interface TabDataSchema {
    id: string;
    text: string;
    active: boolean;
}

type InstanceSetting = {
    id: string;
    label: string;
    settings: Setting[];
}

type Setting = {
    id: string;
    name: string;
    type: "text" | "radio" | "number" | "switch";
    label: string;
    options?: Option[];
    required: boolean;
}

type Option = {
    optId: string;
    label?: string;
    value?: string;
    min?: string;
    max?: string;
    checked?: boolean;
}

router.get('/tabs', (req, res) => {
    try {
        const settingsData = bedrockJson.createInstanceSettings as InstanceSetting[];
        res.status(200).json({ settingsData });
    } catch(error) {
        logger.error('Fatal Error:', error);
        res.status(500).json({ code: 'internal_server_error', message: 'サーバーで予期せぬエラーが発生しました。', details: null });
    }
})

router.get('/lists', (req, res) => {
    try {
        const tabData: TabDataSchema[] = bedrockJson.createInstanceTabs;
        res.status(200).json({ tabData });
    } catch (error) {
        logger.error('Fatal Error:', error);
        res.status(500).json({ code: 'internal_server_error', message: 'サーバーで予期せぬエラーが発生しました。', details: null });
    }
});

export default router;
