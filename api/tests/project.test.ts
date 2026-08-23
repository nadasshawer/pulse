import { buildApp } from "../src/app.js";
import "dotenv/config";
import type { FastifyInstance } from "fastify";

describe("GET /projects", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 200 with projects array", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/projects",
    });

    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.json())).toBe(true);
  });
});

describe("POST /projects", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 201 when project is created", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/projects",
      payload: { name: "test-project" },
    });

    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.name).toBe("test-project");
    expect(body.apiKey).toEqual(expect.any(String));
  });
});
