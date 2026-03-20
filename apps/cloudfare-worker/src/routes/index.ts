import { Hono } from "hono"
import { WebhookController } from "../controllers/webhook.controller"
import { AssetsController } from "../controllers/assets.controller"
import { TokenizationController } from "../controllers/tokenization.controller"

const app = new Hono<{ Bindings: Env }>()

// Health
app.get("/", WebhookController.healthCheck)

// Settlement cron (called by Cloudflare Cron trigger or manually)
app.post("/process-events", WebhookController.processEvents)

// Assets
app.get("/api/assets/supported", AssetsController.getSupportedStocks)
app.get("/api/assets", AssetsController.getAllAssets)

// Tokenization
app.post("/api/tokenization/mint", TokenizationController.mint)
app.post("/api/tokenization/redeem", TokenizationController.redeem)
app.get("/api/tokenization/requests", TokenizationController.listRequests)
app.get("/api/tokenization/requests/:id", TokenizationController.getRequest)

// Prices
app.get("/api/stocks/prices", TokenizationController.getPrices)

export default app
