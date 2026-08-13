import type { FastifyInstance } from "fastify";
import { db } from "../database.js";

export async function alertRulesRoutes(app: FastifyInstance): Promise<void> {
  app.post("/alert-rules", async (request, reply) => {
    const params = request.body as {
      projectId: string;
      metricName: string;
      threshold: number;
      operator: "gt" | "lt" | "gte" | "lte" | "eq";
    };

    const projectId = Number(params.projectId);

    if (!Number.isInteger(projectId) || projectId < 1) {
      reply.status(400);
      return { error: "Invalid projectId" };
    }

    if (
      typeof params.metricName !== "string" ||
      params.metricName.length === 0
    ) {
      reply.status(400);
      return { error: "Invalid metricName" };
    }

    if (typeof params.threshold !== "number" || isNaN(params.threshold)) {
      reply.status(400);
      return { error: "Invalid threshold" };
    }

    if (!["gt", "lt", "gte", "lte", "eq"].includes(params.operator)) {
      reply.status(400);
      return { error: "Invalid operator" };
    }

    const newRule = await db.alertRule.create({
      data: {
        projectId: projectId,
        metricName: params.metricName,
        threshold: params.threshold,
        operator: params.operator,
      },
    });

    reply.status(201);
    return newRule;
  });

  app.get("/alert-rules", async (request, reply) => {
    const params = request.query as { projectId?: string };
    const where: {
      projectId?: number;
    } = {};

    if (params.projectId) {
      const projectId = Number(params.projectId);

      if (!Number.isInteger(projectId) || projectId < 1) {
        reply.status(400);
        return { error: "Invalid projectId" };
      } else {
        where.projectId = projectId;
      }
    }

    const result = await db.alertRule.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return result;
  });
}
