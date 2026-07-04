import { Router } from "express";

const router = Router();

router.post("/leave");
router.get("/leave/me");
router.get("/leave");
router.patch("/leave/:id");
