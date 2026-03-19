import { Hono } from "hono";
import { WebhookController } from "../controllers/webhook.controller";
import { AssetsController } from "../controllers/assets.controller";

const app = new Hono<{ Bindings: Env }>();

app.get("/", WebhookController.healthCheck);
app.post("/process-events", WebhookController.processEvents);

// Assets endpoints
app.get("/api/assets/supported", AssetsController.getSupportedStocks);
app.get("/api/assets", AssetsController.getAllAssets);

// Can also be triggered by a cron job hitting this endpoint or via scheduled handler

export default app;
