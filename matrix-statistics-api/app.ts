import cors from "cors";
import type { Application } from "express";
import express from "express";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import statisticsRouter from "./src/modules/statistics/v1/routes.ts";
import { errorMiddleware } from "./src/shared/http/middlewares.ts";

const app : Application = express();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN?.split(",") || "*" }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const openApiDocument = YAML.parse(
  readFileSync(join(__dirname, "openapi.yaml"), "utf8")
);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/api/v1/statistics", statisticsRouter);
app.use(errorMiddleware);

export default app;
