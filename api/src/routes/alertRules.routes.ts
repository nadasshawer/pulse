import type { FastifyInstance } from "fastify";
import { db } from "../database.js";

export async function alertRulesRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/alert-rules",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            projectId: { type: "integer", minimum: 1 },
          },
        },
      },
    },
    async (request, _reply) => {
      const params = request.query as { projectId?: number };
      const where: {
        projectId?: number;
      } = {};

      if (params.projectId !== undefined) {
        where.projectId = params.projectId;
      }

      const result = await db.alertRule.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return result;
    },
  );

  app.post(
    "/alert-rules",
    {
      schema: {
        body: {
          type: "object",
          required: ["projectId", "metricName", "threshold", "operator"],
          properties: {
            projectId: { type: "integer", minimum: 1 },
            metricName: { type: "string", minLength: 1 },
            threshold: { type: "number" },
            operator: {
              type: "string",
              enum: ["gt", "lt", "gte", "lte", "eq"],
            },
          },
        },
      },
    },
    async (request, reply) => {
      const params = request.body as {
        projectId: number;
        metricName: string;
        threshold: number;
        operator: "gt" | "lt" | "gte" | "lte" | "eq";
      };

      const newRule = await db.alertRule.create({
        data: {
          projectId: params.projectId,
          metricName: params.metricName,
          threshold: params.threshold,
          operator: params.operator,
        },
      });

      reply.status(201);
      return newRule;
    },
  );
}
