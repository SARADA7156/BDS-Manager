import { Router } from "express";

const router = Router();

router.get('/', (req, res, next) => {
    try {
        res.render('layout', {
        stylesheets: ['components/header', 'pages/index'],
        header: 'headerHome.ejs',
        footer: 'footer.ejs'
    });
    } catch(error) {
        next(error);
    }
});

export default router;