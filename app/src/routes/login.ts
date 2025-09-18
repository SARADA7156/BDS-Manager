import { Router } from "express";

const router = Router();

router.get('/', (req, res, next) => {
    try {
        res.render('layout', {
        stylesheets: ['pages/login'],
        page: 'login.ejs',
        footer: 'footer.ejs'
    });
    } catch(error) {
        next(error);
    }
});

export default router;