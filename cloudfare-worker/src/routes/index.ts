import { Hono } from "hono";
import { WebhookController } from "../controllers/webhook.controller";

const app = new Hono<{ Bindings: Env }>();

app.get("/", WebhookController.healthCheck);
app.post("/process-events", WebhookController.processEvents);
// Can also be triggered by a cron job hitting this endpoint or via scheduled handler

export default app;
