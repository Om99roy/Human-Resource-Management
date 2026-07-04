import { Router } from "express";

const router = Router();

router.post("/attendance/check-in");
router.post("/attendance/check-out");
router.get("/attendance/me");
router.get("/attendance");
