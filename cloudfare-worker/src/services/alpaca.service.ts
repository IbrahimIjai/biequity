export class AlpacaService {
	private apiKey: string;
	private secretKey: string;
	private baseUrl: string;

	constructor(env: Env) {
		this.apiKey = env.ALPACA_API_KEY;
		this.secretKey = env.ALPACA_SECRET_KEY;
		// Use paper trading URL for dev/test, live for prod.
		// Ideally this should also be in Env, but defaulting to paper for now.
		this.baseUrl = "https://paper-api.alpaca.markets/v2";
	}

	private async request(endpoint: string, method: string = "GET", body?: any) {
		const url = `${this.baseUrl}${endpoint}`;
		const headers = {
			"APCA-API-KEY-ID": this.apiKey,
			"APCA-API-SECRET-KEY": this.secretKey,
			"Content-Type": "application/json",
		};

		const response = await fetch(url, {
			method,
			headers,
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Alpaca API Error: ${response.status} ${response.statusText} - ${errorText}`,
			);
		}

		return await response.json();
	}

	async getAccount() {
		return await this.request("/account");
	}

	async placeOrder(
		symbol: string,
		qty: number,
		side: "buy" | "sell",
		type: "market" | "limit" = "market",
	) {
		return await this.request("/orders", "POST", {
			symbol,
			qty,
			side,
			type,
			time_in_force: "day",
		});
	}

	async getPosition(symbol: string) {
		try {
			return await this.request(`/positions/${symbol}`);
		} catch (error: any) {
			if (error.message.includes("404")) {
				return null; // No position
			}
			throw error;
		}
	}

	async getAssets() {
		return await this.request("/assets?status=active");
	}
}
