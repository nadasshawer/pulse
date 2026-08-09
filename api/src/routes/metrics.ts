import type { FastifyInstance } from "fastify";
import type { Metric } from "../types/models.js";
import { db } from "../database.js";

export async function metricsRoutes(app: FastifyInstance): Promise<void> {
  app.get("/metrics", async (request, reply) => {
    let result;
    const params = request.query as { projectId?: string };

    if (params.projectId === undefined) {
      result = await db.metric.findMany({
        orderBy: { receivedAt: "desc" },
      });
    } else {
      const projectId = Number(params.projectId);

      if (!Number.isInteger(projectId) || projectId < 1) {
        reply.status(400);
        return { error: "Invalid projectId" };
      } else {
        result = await db.metric.findMany({
          orderBy: { receivedAt: "desc" },
          where: { projectId: projectId },
        });
      }
    }

    return result;
  });

  app.get("/metrics/latest", async (request, reply) => {
    const params = request.query as { projectId: string };
    const projectId = Number(params.projectId);

    if (!projectId || projectId < 1 || !Number.isInteger(projectId)) {
      reply.status(400);
      return { error: "Invalid projectId" };
    }

    const result = await db.$queryRaw`
      SELECT DISTINCT ON (hostname, name)
        id,
        name,
        hostname,
        value,
        received_at AS "receivedAt",
        project_id AS "projectId"
      FROM metrics
      WHERE project_id = ${projectId}
      ORDER BY hostname, name, received_at DESC
    `;

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
