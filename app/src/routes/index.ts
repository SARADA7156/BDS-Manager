import { Router } from "express";

const router = Router();

router.get('/', (req, res, next) => {
    try {
        res.render('layout', {
        style: 'index.css',
        header: 'headerHome.ejs'
    });
    } catch(error) {
        next(error);
    }
});

export default router;