import type { FastifyInstance } from "fastify";
import { db } from "../database.js";

export async function alertEventsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/alert-events",
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
      const where: { rule?: { projectId: number } } = {};

      if (params.projectId !== undefined) {
        where.rule = { projectId: params.projectId };
      }

      const result = await db.alertEvent.findMany({
        where,
        orderBy: { firedAt: "desc" },
      });

      return result;
    },
  );
}
