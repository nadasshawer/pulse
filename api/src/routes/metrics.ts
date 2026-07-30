import type { FastifyInstance } from "fastify";
import { db } from "../database.js";

export async function metricsRoutes(app: FastifyInstance) {
  app.get("/metrics", async (_request, _reply) => {
    const metrics = await db.metrics.findMany({
      orderBy: { received_at: "desc" },
    });

    return metrics;
  });

  app.post(
    "/metrics",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "value"],
          properties: {
            name: { type: "string", minLength: 1 },
            value: { type: "number" },
          },
        },
      },
    },
    async (request, reply) => {
      const reqBody = request.body as { name: string; value: number };
      const newMetric = await db.metrics.create({
        data: {
          name: reqBody.name,
          value: reqBody.value,
        },
      });

      reply.status(201);
      return newMetric;
    },
  );
}
