import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../../../../app.ts";

const JWT_SECRET = process.env.JWT_SECRET;

const generateTestToken = (): string => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ sub: "test-user" }, JWT_SECRET, { expiresIn: "1h" });
};

const validBody = {
  q: [
    [1, 2],
    [3, 4]
  ],
  r: [
    [5, 6],
    [7, 8]
  ]
};

describe("POST /api/v1/statistics", () => {
  let token: string;

  beforeAll(() => {
    token = generateTestToken();
  });

  afterAll(() => {
    // No cleanup needed for this test
  });

  it("should return 200 OK with statistics for valid request and valid token", async () => {
    const response = await request(app)
      .post("/api/v1/statistics")
      .set("Authorization", `Bearer ${token}`)
      .send(validBody);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).toHaveProperty("max");
    expect(response.body.data).toHaveProperty("min");
    expect(response.body.data).toHaveProperty("average");
    expect(response.body.data).toHaveProperty("sum");
    expect(response.body.data).toHaveProperty("length");
    expect(response.body.data).toHaveProperty("isDiagonal");
    expect(response.body.data.isDiagonal).toHaveProperty("q");
    expect(response.body.data.isDiagonal).toHaveProperty("r");
    expect(response.body.data.sum).toBe(36);
    expect(response.body.data.average).toBe(4.5);
    expect(response.body.data.max).toBe(8);
    expect(response.body.data.min).toBe(1);
    expect(response.body.data.length).toBe(8);
    expect(response.body.data.isDiagonal.q).toBe(false);
    expect(response.body.data.isDiagonal.r).toBe(false);
  });

  it("should return 401 INVALID_SESSION when no authorization header is provided", async () => {
    const response = await request(app)
      .post("/api/v1/statistics")
      .send(validBody);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("INVALID_SESSION");
  });

  it("should return 401 INVALID_SESSION when the header is not Bearer format", async () => {
    const response = await request(app)
      .post("/api/v1/statistics")
      .set("Authorization", `Basic ${token}`)
      .send(validBody);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("INVALID_SESSION");
  });

  it("should return 401 INVALID_SESSION when the token was signed with another secret", async () => {
    const forgedToken = jwt.sign({ sub: "attacker" }, "another-secret", {
      expiresIn: "1h"
    });

    const response = await request(app)
      .post("/api/v1/statistics")
      .set("Authorization", `Bearer ${forgedToken}`)
      .send(validBody);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("INVALID_SESSION");
  });

  it("should return 401 INVALID_SESSION when the token is expired", async () => {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const expiredToken = jwt.sign({ sub: "test-user" }, JWT_SECRET, {
      expiresIn: -3600
    });

    const response = await request(app)
      .post("/api/v1/statistics")
      .set("Authorization", `Bearer ${expiredToken}`)
      .send(validBody);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("INVALID_SESSION");
  });

  it("should return 401 INVALID_SESSION when the token is garbage", async () => {
    const response = await request(app)
      .post("/api/v1/statistics")
      .set("Authorization", "Bearer not-a-jwt-at-all")
      .send(validBody);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("INVALID_SESSION");
  });

  it("should return 400 VALIDATION_ERROR with a valid token but an invalid body", async () => {
    const response = await request(app)
      .post("/api/v1/statistics")
      .set("Authorization", `Bearer ${token}`)
      .send({ q: "not-a-matrix", r: [] });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("VALIDATION_ERROR");
  });
});
