const ROOT_URL =
	process.env.NEXT_PUBLIC_URL ||
	(process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
	"http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
	accountAssociation: {
		header:
			"eyJmaWQiOjgxMTU1OSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDA2NTc4NzI2RTFhZmFBZDk2OTkyMmIwOEJiOEE5M0VGQWE4ZDg2MEUifQ",
		payload: "eyJkb21haW4iOiJ3d3cuYmllcXVpdHkueHl6In0",
		signature:
			"sxHwytA7HfAVNJAdgX4aQt49Yd/d5/rR/ZJkPRoCw/Ecm4qcK8yvTTS5TKsAFo03N+CqKbdWDmPSkzQEBx0SLxw=",
	},
	baseBuilder: {
		ownerAddress: "0xa608CB83Dae35763180f04dD3eddEB112b91629e",
		allowedAddresses: ["0xa608CB83Dae35763180f04dD3eddEB112b91629e"],
	},
	miniapp: {
		version: "1",
		name: "biequity",
		subtitle: "Permissionless Stock Issuance Protocol",
		description:
			"Issue and trade tokenized equities backed by stablecoins on Base. Mint, manage, and redeem with transparent onchain collateral.",
		screenshotUrls: [
			`${ROOT_URL}/images/screenshot1.png`,
			`${ROOT_URL}/images/screenshot2.png`,
			`${ROOT_URL}/images/screenshot3.png`,
		],
		iconUrl: `${ROOT_URL}/icon.png`,
		splashImageUrl: `${ROOT_URL}/splash.png`,
		splashBackgroundColor: "#000000",
		homeUrl: ROOT_URL,
		webhookUrl: `${ROOT_URL}/api/webhook`,
		primaryCategory: "utility",
		tags: ["fully backed stocks, buy stocks"],
		heroImageUrl: `${ROOT_URL}/hero.png`,
		tagline: "Buy Fully Backed Stocks with Crypto",
		ogTitle: "Biequity — Buy Fully Backed Stocks with Crypto",
		ogDescription:
			"Issue and trade tokenized equities backed by stablecoins on Base. Mint, manage, and redeem with transparent onchain collateral.",
		ogImageUrl: `${ROOT_URL}/hero.png`,
	},
} as const;
