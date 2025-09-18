import { Router } from "express";

const router = Router();

router.post('/create', (req, res) => {
    console.log(req.body);
});

export default router;