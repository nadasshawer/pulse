import type { FastifyInstance } from "fastify";
import { db } from "../database.js";

export async function projectRoutes(app: FastifyInstance) {
  app.get("/projects", async (_request, _reply) => {
    const result = await db.project.findMany({
      orderBy: { createdAt: "desc" },
    });

    return result;
  });

  app.post(
    "/projects",
    {
      schema: {
        body: {
          type: "object",
          required: ["name"],
          properties: { name: { type: "string", minLength: 1 } },
        },
      },
    },
    async (request, reply) => {
      const reqBody = request.body as {
        name: string;
      };

      const newProject = await db.project.create({
        data: {
          name: reqBody.name,
        },
      });

      reply.status(201);
      return newProject;
    },
  );
}
