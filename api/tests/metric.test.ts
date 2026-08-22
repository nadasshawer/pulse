import { buildApp } from "../src/app.js";

import "dotenv/config";

import type { FastifyInstance } from "fastify";

describe("GET /metrics", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 200 with metrics array", async () => {
    const response = await app.inject({
      method: "GET",

      url: "/metrics",
    });

    expect(response.statusCode).toBe(200);

    expect(Array.isArray(response.json())).toBe(true);
  });
});

describe("POST /metrics", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 401 when x-api-key not given", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/metrics",
      payload: {
        name: "test_metric",
        value: 50,
        hostname: "test-host",
      },
    });

    expect(response.statusCode).toBe(401);
  });
});
