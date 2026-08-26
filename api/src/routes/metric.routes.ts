import type { FastifyInstance } from "fastify";
import type { Metric, Rule } from "../types/models.js";
import { db } from "../database.js";
import { checkAlerts } from "../services/alertRules.service.js";

export async function metricsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/metrics",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            projectId: { type: "integer", minimum: 1 },
            from: { type: "string", format: "date-time" },
            to: { type: "string", format: "date-time" },
          },
        },
      },
    },
    async (request, _reply) => {
      const params = request.query as {
        projectId?: number;
        from?: string;
        to?: string;
      };

      const where: {
        projectId?: number;
        receivedAt?: { gte?: Date; lte?: Date };
      } = {};

      if (params.projectId !== undefined) {
        where.projectId = params.projectId;
      }

      if (params.from !== undefined) {
        where.receivedAt = { ...where.receivedAt, gte: new Date(params.from) };
      }

      if (params.to !== undefined) {
        where.receivedAt = { ...where.receivedAt, lte: new Date(params.to) };
      }

      const result = await db.metric.findMany({
        where,
        orderBy: { receivedAt: "desc" },
      });

      return result;
    },
  );

  app.get(
    "/metrics/latest",
    {
      schema: {
        querystring: {
          type: "object",
          required: ["projectId"],
          properties: {
            projectId: { type: "integer", minimum: 1 },
          },
        },
      },
    },
    async (request, _reply) => {
      const params = request.query as { projectId: number };

      const result = await db.$queryRaw`
      SELECT DISTINCT ON (hostname, name)
        id,
        name,
        hostname,
        value,
        received_at AS "receivedAt",
        project_id AS "projectId"
      FROM metrics
      WHERE project_id = ${params.projectId}
      ORDER BY hostname, name, received_at DESC
    `;

      return result;
    },
  );

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
      let newAlertEvent;

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

      const firedAlerts = await checkAlerts(newMetric);

      for (const alert of firedAlerts) {
        newAlertEvent = await db.alertEvent.create({
          data: {
            metricId: newMetric.id,
            ruleId: alert.id,
          },
        });
      }

      reply.status(201);
      return { newMetric, firedAlerts };
    },
  );
}
