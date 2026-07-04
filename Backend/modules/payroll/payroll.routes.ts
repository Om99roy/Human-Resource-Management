import { Router } from "express";

const router = Router();

router.post("/payroll");
router.patch("/payroll/:id");

router.get("/payroll/me");
