import Fastify from "fastify";
import { env } from "node:process";

const app = Fastify();
const PORT = Number(env.PORT) || 5000;

type Metric = {
  name: string;
  value: number;
  receivedAt: string;
};

const metrics: Metric[] = [];

app.get("/health", async (_request, _reply) => {
  return { status: "ok" };
});

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

await app.listen({ port: PORT });
console.log(`Fastify app is listening on port ${PORT}...`);
