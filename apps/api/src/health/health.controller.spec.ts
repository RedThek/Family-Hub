import { ServiceUnavailableException } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { PrismaService } from "../prisma/prisma.service";

describe("HealthController", () => {
  it("retourne ok lorsque la base répond", async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ "?column?": 1 }]),
    } as unknown as PrismaService;
    const controller = new HealthController(prisma);

    await expect(controller.check()).resolves.toEqual({
      status: "ok",
      db: "up",
    });
  });

  it("signale une base indisponible", async () => {
    const prisma = {
      $queryRaw: jest.fn().mockRejectedValue(new Error("connection refused")),
    } as unknown as PrismaService;
    const controller = new HealthController(prisma);

    await expect(controller.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
