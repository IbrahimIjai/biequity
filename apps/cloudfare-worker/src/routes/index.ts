import { Hono } from "hono";
import { WebhookController } from "../controllers/webhook.controller";
import { AssetsController } from "../controllers/assets.controller";

const app = new Hono<{ Bindings: Env }>();

app.get("/", WebhookController.healthCheck);
app.post("/process-events", WebhookController.processEvents);
app.get("/api/assets/supported", AssetsController.getSupportedStocks);
app.get("/api/assets", AssetsController.getAllAssets);

export default app;
