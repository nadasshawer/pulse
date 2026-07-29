import Fastify from "fastify";
import { metricsRoutes } from "./routes/metrics.js";
import { healthRoutes } from "./routes/health.js";

export async function buildApp() {
  const app = Fastify();
  await app.register(metricsRoutes);
  await app.register(healthRoutes);
  return app;
}
