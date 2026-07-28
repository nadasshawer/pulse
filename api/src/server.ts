import { buildApp } from "./app.js";
import { env } from "node:process";

const app = await buildApp();
const PORT = Number(env.PORT) || 5000;

await app.listen({ port: PORT });
console.log(`Fastify app is listening on port ${PORT}...`);
