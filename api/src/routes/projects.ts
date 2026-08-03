import type { FastifyInstance } from "fastify";
import type { Project } from "../types/models.js";
import { db } from "../database.js";

export async function projectRoutes(app: FastifyInstance): Promise<void> {
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
      const reqBody = request.body as Project;
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
