import type { Router } from "express";
import express from "express";
import { authenticateMiddleware } from "../../../shared/http/middlewares.ts";
import { wrapperAsyncFn } from "../../../shared/utils/wrappers.ts";
import * as controller from "./controller.ts";

const router: Router = express.Router();

router.post("/", authenticateMiddleware, wrapperAsyncFn(controller.calculateStatistics));

export default router;
