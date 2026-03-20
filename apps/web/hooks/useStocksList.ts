"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SUPPORTED_STOCKS_ENDPOINT } from "@/config/api";
import { type Token } from "@/lib/tokens-list";

/**
 * Alpaca Asset response type (from server)
 */
interface AlpacaAsset {
	id: string;
	class: string;
	exchange: string;
	symbol: string;
	name: string;
	status: string;
	tradable: boolean;
	marginable: boolean;
	shortable: boolean;
	easy_to_borrow: boolean;
	fractionable: boolean;
}

/**
 * Transform Alpaca asset to our Token type
 */
function transformAssetToToken(asset: AlpacaAsset): Token {
	return {
		symbol: asset.symbol,
		name: asset.name,
		icon: `/tokens/${asset.symbol}.png`,
		decimals: 18, // Default for stock tokens
		address: `0x0000000000000000000000000000000000000000${asset.symbol}`,
		// feedId will be added separately if available from our static list
	};
}

/**
 * Hook to fetch supported stocks from our Cloudflare Worker
 * The server filters assets to only return stocks in SUPPORTED_STOCK_SYMBOLS
 * This reduces payload size and keeps filtering logic centralized
 */
export function useStocksList() {
	return useQuery({
		queryKey: ["stocks-list", "supported"],
		queryFn: async () => {
			try {
				const response = await axios.get<AlpacaAsset[]>(
					SUPPORTED_STOCKS_ENDPOINT,
					{
						headers: {
							"Content-Type": "application/json",
						},
					},
				);

				const tokens = response.data.map(transformAssetToToken);

				return tokens;
			} catch (error) {
				console.error("Failed to fetch stocks list:", error);
				throw error;
			}
		},
		staleTime: 1000 * 60 * 60, // 1 hour - stock list doesn't change often
		refetchOnWindowFocus: false,
		retry: 2,
	});
}
