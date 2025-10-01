import { Router } from "express";
import { logger } from "../../../../services/log/logger";
import bedrockJson from "../../../../config/bedrock.json";

const router = Router();

interface ListDataSchema {
    id: string;
    text: string;
}

type TabDataSchema = {
    id: string;
    label: string;
    settings: Setting[]
}

type Setting = {
    id: string;
    name: string;
    type: 'text' | 'number' | 'radio' | 'switch';
    label: string;
    options: SettingOptions[];
    required: boolean;
    edit: boolean;
}

type SettingOptions = {
    optId?: string;
    value?: string;
    label?: string;
    min?: string;
    max?: string;
    checked: boolean;
}

router.get('/tabs', (req, res) => {
    try {
        const tabData = bedrockJson.settingTabs as TabDataSchema[];

        res.status(200).json({ tabData });
    } catch(error) {
        logger.error('Fatal Error:', error);
        res.status(500).json({ code: 'internal_server_error', message: 'サーバーで予期せぬエラーが発生しました。', details: null });
    }
});

router.get('/lists', (req, res) => {
    try {
        const listData: ListDataSchema[] = bedrockJson.createInstanceTabs;
        res.status(200).json({ listData });
    } catch (error) {
        logger.error('Fatal Error:', error);
        res.status(500).json({ code: 'internal_server_error', message: 'サーバーで予期せぬエラーが発生しました。', details: null });
    }
});

export default router;
