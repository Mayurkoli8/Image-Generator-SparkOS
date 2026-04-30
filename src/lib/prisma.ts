import { PrismaClient } from "@prisma/client";

declare global {
  var __brandposterPrisma: PrismaClient | undefined;
}

export function getPrisma() {
  if (!global.__brandposterPrisma) {
    global.__brandposterPrisma = new PrismaClient();
  }

  return global.__brandposterPrisma;
}
