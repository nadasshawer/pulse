import type { FastifyInstance } from "fastify";
import type { Metric } from "../types/models.js";
import { db } from "../database.js";

export async function metricsRoutes(app: FastifyInstance): Promise<void> {
  app.get("/metrics", async (_request, _reply) => {
    const result = await db.metric.findMany({
      orderBy: { receivedAt: "desc" },
    });

    return result;
  });

  app.post(
    "/metrics",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "value", "hostname", "projectId"],
          properties: {
            name: { type: "string", minLength: 1 },
            value: { type: "number" },
            hostname: { type: "string", minLength: 1 },
            projectId: { type: "integer" },
          },
        },
      },
    },
    async (request, reply) => {
      const reqBody = request.body as Metric;
      const newMetric = await db.metric.create({
        data: {
          name: reqBody.name,
          value: reqBody.value,
          hostname: reqBody.hostname,
          projectId: reqBody.projectId,
        },
      });

      reply.status(201);
      return newMetric;
    },
  );
}
