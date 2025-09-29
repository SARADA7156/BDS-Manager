import { Router } from "express";

const router = Router();

router.post('/', (req, res) => {
    console.log(req.body);
    res.status(200)
});

export default router;