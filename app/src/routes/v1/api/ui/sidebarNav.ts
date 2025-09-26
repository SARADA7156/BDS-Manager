import { Router } from "express";
import { sideNav } from '../../../../config/ui/nav.json';

const router = Router();

type SideNavItems = {
    id: string;
    link: string;
    label: string;
    icon: string;
}

router.get('/', (req, res) => {
    try {
        const nav: SideNavItems[] = sideNav.admin;
        res.status(200).json({ nav });
    } catch(error) {
        res.status(500).json({ status: 500, code: "internal_server_error", message: "サーバー側で予期せぬエラーが発生しました。" })
    }
});

export default router;