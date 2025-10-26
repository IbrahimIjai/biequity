export const BIEQUITY_CORE_ABI = [
	{
		type: "constructor",
		inputs: [
			{ name: "_usdc", type: "address", internalType: "address" },
			{ name: "_pyth", type: "address", internalType: "address" },
			{ name: "_treasury", type: "address", internalType: "address" },
		],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "FACTORY",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "contract BiequityTokenFactory",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "FEE_BPS",
		inputs: [],
		outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "PYTH",
		inputs: [],
		outputs: [{ name: "", type: "address", internalType: "contract IPyth" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "USDC",
		inputs: [],
		outputs: [{ name: "", type: "address", internalType: "contract IERC20" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "buy",
		inputs: [
			{ name: "symbol", type: "string", internalType: "string" },
			{ name: "usdcAmount", type: "uint256", internalType: "uint256" },
		],
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "owner",
		inputs: [],
		outputs: [{ name: "", type: "address", internalType: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "registerStock",
		inputs: [
			{ name: "symbol", type: "string", internalType: "string" },
			{ name: "name", type: "string", internalType: "string" },
			{ name: "pythFeedId", type: "bytes32", internalType: "bytes32" },
			{
				name: "minBackedRatio",
				type: "uint256",
				internalType: "uint256",
			},
		],
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "renounceOwnership",
		inputs: [],
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "stockCounter",
		inputs: [],
		outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "stocksByToken",
		inputs: [{ name: "", type: "address", internalType: "address" }],
		outputs: [
			{
				name: "tokenAddress",
				type: "address",
				internalType: "address",
			},
			{ name: "id", type: "uint256", internalType: "uint256" },
			{ name: "totalIssued", type: "uint256", internalType: "uint256" },
			{ name: "totalBacked", type: "uint256", internalType: "uint256" },
			{
				name: "totalPending",
				type: "uint256",
				internalType: "uint256",
			},
			{ name: "usdcBalance", type: "uint256", internalType: "uint256" },
			{
				name: "minBackedRatio",
				type: "uint256",
				internalType: "uint256",
			},
			{ name: "pythFeedId", type: "bytes32", internalType: "bytes32" },
			{ name: "active", type: "bool", internalType: "bool" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "tokenBySymbol",
		inputs: [{ name: "", type: "string", internalType: "string" }],
		outputs: [{ name: "", type: "address", internalType: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "getStockAmtFromUsd",
		inputs: [
			{ name: "symbol", type: "string", internalType: "string" },
			{ name: "usdAmount", type: "uint256", internalType: "uint256" },
		],
		outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "transferOwnership",
		inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "treasury",
		inputs: [],
		outputs: [{ name: "", type: "address", internalType: "address" }],
		stateMutability: "view",
	},
	{
		type: "event",
		name: "OwnershipTransferred",
		inputs: [
			{
				name: "previousOwner",
				type: "address",
				indexed: true,
				internalType: "address",
			},
			{
				name: "newOwner",
				type: "address",
				indexed: true,
				internalType: "address",
			},
		],
		anonymous: false,
	},
	{
		type: "event",
		name: "StockRegistered",
		inputs: [
			{
				name: "symbol",
				type: "string",
				indexed: false,
				internalType: "string",
			},
			{
				name: "id",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
			{
				name: "pythFeedId",
				type: "bytes32",
				indexed: false,
				internalType: "bytes32",
			},
			{
				name: "tokenAddress",
				type: "address",
				indexed: false,
				internalType: "address",
			},
		],
		anonymous: false,
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
	{
		type: "event",
		name: "TokensSettled",
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
		],
		anonymous: false,
	},
	{
		type: "error",
		name: "OwnableInvalidOwner",
		inputs: [{ name: "owner", type: "address", internalType: "address" }],
	},
	{
		type: "error",
		name: "OwnableUnauthorizedAccount",
		inputs: [{ name: "account", type: "address", internalType: "address" }],
	},
	{
		type: "error",
		name: "SafeERC20FailedOperation",
		inputs: [{ name: "token", type: "address", internalType: "address" }],
	},
] as const;


forge create ./src/BiequityCore.sol:BiequityCore \
	--rpc-url $BASE_RPC_URL \
	--account basedeployer1 \
	--broadcast --verify \
	--etherscan-api-key $BASE_SEPOLIA_RPC_URL \
	--constructor-args 0x036CbD53842c5426634e7929541eC2318f3dCF7e 0xA2aa501b19aff244D90cc15a4Cf739D2725B5729 0xE4137238fad21B7840A1D6F30bb4b8eb0507Db7e