import type { FastifyInstance } from "fastify";
import type { Metric } from "../types/models.js";
import { db } from "../database.js";

export async function metricsRoutes(app: FastifyInstance): Promise<void> {
  app.get("/metrics", async (_request, reply) => {
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
          required: ["name", "value", "hostname"],
          properties: {
            name: { type: "string", minLength: 1 },
            value: { type: "number" },
            hostname: { type: "string", minLength: 1 },
          },
        },
      },
    },
    async (request, reply) => {
      const apiKey = request.headers["x-api-key"];

      if (!apiKey || typeof apiKey !== "string") {
        reply.status(401);
        return { error: "API key required" };
      }

      const reqBody = request.body as Metric;
      const project = await db.project.findUnique({
        where: { apiKey: apiKey },
      });

      if (!project) {
        reply.status(401);
        return { error: "Unauthorized" };
      }

      const newMetric = await db.metric.create({
        data: {
          name: reqBody.name,
          value: reqBody.value,
          hostname: reqBody.hostname,
          projectId: project.id,
        },
      });

      reply.status(201);
      return newMetric;
    },
  );
}
