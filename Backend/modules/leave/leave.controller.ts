import type { Request, Response } from "express";
import * as service from "./leave.service";

export const applyLeave = async (req: Request, res: Response) => {
  res.json(await service.applyLeave(req.user.id, req.body));
};

export const myLeaves = async (req: Request, res: Response) => {
  res.json(await service.myLeaves(req.user.id));
};

export const allLeaves = async (_req: Request, res: Response) => {
  res.json(await service.allLeaves());
};

export const updateLeaveStatus = async (req: Request, res: Response) => {
  res.json(
    await service.updateLeaveStatus(
      Number(req.params.id),
      req.user.id,
      req.body.status,
      req.body.adminComment
    )
  );
};
