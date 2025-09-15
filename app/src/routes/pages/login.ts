import { Router } from "express";

const router = Router();

router.get('/', (req, res, next) => {
    try {
        res.render('layout', {
        style: 'login.css',
        page: 'login.ejs'
    });
    } catch(error) {
        next(error);
    }
});

export default router;