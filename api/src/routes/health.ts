import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async (_request, reply) => {
    reply.status(200);
    return { status: "ok" };
  });
}
