import { prisma } from "../../shared/prisma/prisma";

/** Returns all notifications for the authenticated user (most recent first) */
export const getMyNotifications = async (employeeId: string) =>
  prisma.notification.findMany({
    where: { employeeId },
    orderBy: { createdAt: "desc" },
  });
