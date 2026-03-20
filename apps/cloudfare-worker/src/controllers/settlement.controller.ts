import { Context } from "hono";
import { Web3Service } from "../services/web3.service";
import { logger } from "../utils/logger";

type ExecuteSettlementBody = {
	txHash: string;
};

export class SettlementController {
	static async execute(c: Context<{ Bindings: Env }>) {
		try {
			const body = await c.req.json<ExecuteSettlementBody>();
			const txHash = body?.txHash?.trim();

			if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
				return c.json(
					{
						success: false,
						error: "txHash is required and must be a valid 0x-prefixed hash",
					},
					400,
				);
			}

			const web3Service = new Web3Service(c.env);
			const result = await web3Service.executeSettlementByTxHash(txHash);

			if (result.success) {
				return c.json(result, 200);
			}

			if (result.status === "pending_confirmations") {
				return c.json(result, 202);
			}

			if (result.status === "pending_or_retry_exhausted") {
				return c.json(result, 202);
			}

			return c.json(result, 500);
		} catch (error) {
			logger.error("Settlement execution failed", {
				error: error instanceof Error ? error.message : String(error),
			});
			return c.json(
				{
					success: false,
					error: "Settlement execution failed",
					message: error instanceof Error ? error.message : String(error),
				},
				500,
			);
		}
	}
}
