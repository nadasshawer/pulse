import type { FastifyInstance } from "fastify";
import type { Project } from "../types/models.js";
import { db } from "../database.js";
import { randomBytes } from "node:crypto";

export async function projectRoutes(app: FastifyInstance): Promise<void> {
  app.get("/projects", async (_request, _reply) => {
    const result = await db.project.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true },
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
      const apiKey = randomBytes(32).toString("hex");
      const reqBody = request.body as Project;
      const newProject = await db.project.create({
        data: {
          name: reqBody.name,
          apiKey: apiKey,
        },
      });

      reply.status(201);
      return newProject;
    },
  );
}
