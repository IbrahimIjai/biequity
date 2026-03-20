export const BIEQUITY_CORE_ABI = [
	{
		type: "function",
		name: "settleTokens",
		inputs: [
			{ name: "symbol", type: "string", internalType: "string" },
			{ name: "amount", type: "uint256", internalType: "uint256" },
		],
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "withdrawUsdcFromStock",
		inputs: [
			{ name: "tokenAddr", type: "address", internalType: "address" },
			{ name: "amount", type: "uint256", internalType: "uint256" },
		],
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		name: "TokensMinted",
		inputs: [
			{
				name: "symbol",
				type: "string",
				indexed: false,
				internalType: "string",
			},
			{
				name: "amount",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
			{
				name: "netUsdc",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
		],
		anonymous: false,
	},
	{
		type: "event",
		name: "TokensRedeemed",
		inputs: [
			{
				name: "symbol",
				type: "string",
				indexed: false,
				internalType: "string",
			},
			{
				name: "amount",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
			{
				name: "usdcOut",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
		],
		anonymous: false,
	},
] as const;
