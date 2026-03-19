import { Context } from "hono";
import { Web3Service } from "../services/web3.service";

export class WebhookController {
	static async processEvents(c: Context<{ Bindings: Env }>) {
		const web3Service = new Web3Service(c.env);

		const buyResults = await web3Service.processBuyQueue();
		const sellResults = await web3Service.processSellQueue();

		return c.json({
			success: true,
			processed: {
				buys: buyResults,
				sells: sellResults,
			},
		});
	}

	static async healthCheck(c: Context) {
		return c.text("OK");
	}
}
