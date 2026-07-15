import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL || "mysql://root:rootpassword@127.0.0.1:3307/appdb";

process.env.DATABASE_URL = databaseUrl;

export const prisma = new PrismaClient();
