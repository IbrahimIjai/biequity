import { Hono } from "hono"
import { cors } from "hono/cors"
import { WebhookController } from "../controllers/webhook.controller"
import { AssetsController } from "../controllers/assets.controller"
import { TokenizationController } from "../controllers/tokenization.controller"
import { SettlementController } from "../controllers/settlement.controller"

const app = new Hono<{ Bindings: Env }>()

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
)

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

// Tx-hash driven settlement endpoint with retries
app.post("/api/settlement/execute", SettlementController.execute)

export default app
