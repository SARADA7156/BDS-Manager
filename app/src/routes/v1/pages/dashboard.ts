import { Router } from "express";

const router = Router();

router.get('/', (req, res, next) => {
    try {
        res.render('layout', {
        style: 'dashboard.css',
        page: 'v1/dashboard.ejs',
        nav: 'sideNav.ejs'
    });
    } catch(error) {
        next(error);
    }
});

export default router;