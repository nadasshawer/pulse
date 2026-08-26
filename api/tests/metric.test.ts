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
  let apiKey: string;
  let projectId: number;

  beforeAll(async () => {
    app = await buildApp();

    // Create a project in the database
    const projResponse = await app.inject({
      method: "POST",
      url: "/projects",
      payload: { name: "test-project" },
    });

    apiKey = projResponse.json().apiKey;
    projectId = projResponse.json().id;

    // Create a rule for that project
    const ruleResponse = await app.inject({
      method: "POST",
      url: "/alert-rules",
      payload: {
        projectId: projectId,
        metricName: "test-metric",
        threshold: 10,
        operator: "gt",
      },
    });

    expect(ruleResponse.statusCode).toBe(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 401 when x-api-key not given", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/metrics",
      payload: {
        name: "test-metric",
        value: 50,
        hostname: "test-host",
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it("returns 401 when api key is invalid", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/metrics",
      headers: { "x-api-key": "bad-key" },
      payload: {
        name: "test-metric",
        value: 50,
        hostname: "test-host",
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it("returns 201 with metric and firedAlerts", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/metrics",
      headers: { "x-api-key": apiKey },
      payload: {
        name: "test-metric",
        value: 50,
        hostname: "test-host",
      },
    });

    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.newMetric.name).toBe("test-metric");
    expect(Array.isArray(body.firedAlerts)).toBe(true);
  });
});
