export const seoConfig = {
	siteName: "Biequity",
	siteTitle: "Biequity - Onchain Stock Trading Platform",
	siteDescription:
		"Issue and trade tokenized equities backed by stablecoins on Base. Mint, manage, and redeem with transparent onchain collateral.",
	siteUrl: process.env.NEXT_PUBLIC_URL || "https://www.biequity.xyz",

	keywords: [
		"tokenized stocks",
		"onchain trading",
		"DeFi",
		"Base blockchain",
		"stablecoin backed",
		"equity tokens",
		"crypto stocks",
		"decentralized finance",
		"blockchain trading",
		"Web3 finance",
		"stock tokenization",
		"onchain equities",
		"crypto trading",
		"defi stocks",
	],

	social: {
		twitter: "@biequity",
		github: "https://github.com/IbrahimIjai/biequity",
	},

	ogImage: {
		width: 1200,
		height: 630,
		alt: "Biequity - Onchain Stock Trading Platform",
	},

	twitterCard: {
		type: "summary_large_image" as const,
		creator: "@biequity",
		site: "@biequity",
	},

	organization: {
		name: "Biequity",
		description:
			"Decentralized platform for trading tokenized stocks on Base blockchain",
		url: "https://www.biequity.xyz",
		logo: "https://www.biequity.xyz/icon-512.png",
		foundingDate: "2024",
		industry: "Financial Technology",
	},

	categories: {
		primary: "finance",
		secondary: ["productivity", "business", "trading"],
		classification: "DeFi Trading Platform",
	},
} as const;

export type SeoConfig = typeof seoConfig;
