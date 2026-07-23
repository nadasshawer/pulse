import Fastify from "fastify";
import { env } from "node:process";

const app = Fastify();
const PORT = Number(env.PORT) || 5000;

app.get("/health", async (_request, _reply) => {
  return { status: "ok" };
});

await app.listen({ port: PORT });
console.log(`Fastify app is listening on port ${PORT}...`);
