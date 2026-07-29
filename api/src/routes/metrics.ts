import type { FastifyInstance } from "fastify";

type Metric = {
  name: string;
  value: number;
  receivedAt: string;
};

const metrics: Metric[] = [];

export async function metricsRoutes(app: FastifyInstance) {
  app.get("/metrics", async (_request, reply) => {
    reply.status(200);
    return metrics;
  });

  app.post("/metrics", (request, reply) => {
    const rBody = request.body as { name: string; value: number };
    const m: Metric = {
      name: rBody.name,
      value: rBody.value,
      receivedAt: new Date().toISOString(),
    };
    metrics.push(m);
    reply.status(201);
    return m;
  });
}
