import { Router } from "express";

const router = Router();

router.get('/', (req, res, next) => {
    try {
        res.render('layout', {
        stylesheets: ['components/header', 'components/headerAction', 'components/nav', 'pages/createInstance'],
        page: 'v1/createInstance.ejs',
        header: 'header.ejs',
        nav: 'sideNav.ejs'
    });
    } catch(error) {
        next(error);
    }
});

export default router;