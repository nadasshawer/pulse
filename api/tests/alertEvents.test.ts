import { buildApp } from "../src/app.js";
import "dotenv/config";
import type { FastifyInstance } from "fastify";

describe("GET /alert-events", () => {
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

    expect(projResponse.statusCode).toBe(201);
    expect(ruleResponse.statusCode).toBe(201);

    // Create a metric in the database
    const metricResponse = await app.inject({
      method: "POST",
      url: "/metrics",
      headers: { "x-api-key": apiKey },
      payload: {
        name: "test-metric",
        value: 99,
        hostname: "test-host",
      },
    });

    expect(metricResponse.statusCode).toBe(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 200 with alert events array", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/alert-events?projectId=${projectId}`,
    });

    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.json())).toBe(true);
    expect(response.json().length).toBeGreaterThan(0);
  });
});
