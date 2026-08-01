import Fastify from "fastify";
import type { FastifyError } from "fastify";
import { Prisma } from "./generated/prisma/client.js";
import { metricsRoutes } from "./routes/metrics.js";
import { healthRoutes } from "./routes/health.js";
import { projectRoutes } from "./routes/projects.js";

// Build app
export async function buildApp() {
  const app = Fastify();

  // Centralized error handler
  app.setErrorHandler((error: FastifyError, request, reply) => {
    request.log.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      // Foreign key failed
      return reply.status(400).send({
        error: "Invalid reference",
      });
    }

    const statusCode =
      typeof error.statusCode === "number" ? error.statusCode : 500;

    return reply.status(statusCode).send({
      error: statusCode >= 500 ? "Internal Server Error" : error.message,
    });
  });

  // Register routes
  await app.register(metricsRoutes);
  await app.register(healthRoutes);
  await app.register(projectRoutes);

  return app;
}
