import { Role } from "@prisma/client";

export type AppJwtPayload = {
  id: string;
  email: string;
  role: Role;
};
