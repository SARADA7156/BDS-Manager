import { Router } from "express";

const router = Router();

router.get('/', (req, res, next) => {
    try {
        res.render('layout', {
        stylesheets: ['components/header', 'components/headerAction', 'components/nav', 'pages/dashboard'],
        page: 'v1/dashboard.ejs',
        header: 'header.ejs',
        nav: 'sideNav.ejs'
    });
    } catch(error) {
        next(error);
    }
});

export default router;