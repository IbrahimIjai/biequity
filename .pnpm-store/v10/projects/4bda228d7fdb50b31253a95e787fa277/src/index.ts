import { Hono } from "hono";
import app from "./routes";
import { Web3Service } from "./services/web3.service";

const worker = new Hono<{ Bindings: Env }>();

worker.route("/", app);

export default {
	fetch: worker.fetch,

	// Scheduled handler for Cron Triggers
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		console.log("Cron trigger fired");
		const web3Service = new Web3Service(env);

		ctx.waitUntil(
			Promise.all([
				web3Service.processBuyQueue(),
				web3Service.processSellQueue(),
			]),
		);
	},
};
