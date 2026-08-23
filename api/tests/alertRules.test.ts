import { buildApp } from "../src/app.js";
import "dotenv/config";
import type { FastifyInstance } from "fastify";

describe("GET /alert-rules", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 200 with alert rules array", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/alert-rules",
    });

    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.json())).toBe(true);
  });
});

describe("POST /alert-rules", () => {
  let app: FastifyInstance;
  let projectId: number;

  beforeAll(async () => {
    app = await buildApp();

    // Create a project in the database
    const projResponse = await app.inject({
      method: "POST",
      url: "/projects",
      payload: { name: "test-project" },
    });

    expect(projResponse.statusCode).toBe(201);
    projectId = projResponse.json().id;
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 201 when alert rule is created", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/alert-rules",
      payload: {
        projectId: projectId,
        metricName: "test-metric-name",
        threshold: 90,
        operator: "gt",
      },
    });

    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.projectId).toBe(projectId);
    expect(body.metricName).toBe("test-metric-name");
    expect(body.threshold).toBe(90);
    expect(body.operator).toBe("gt");
  });
});
