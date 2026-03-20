"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SUPPORTED_STOCKS_ENDPOINT } from "@/config/api";
import { BASE_SEPOLIA_CHAIN_ID } from "@/lib/tokens-list";
import { type Token } from "@/lib/tokens-list";

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

function transformAssetToToken(asset: AlpacaAsset): Token {
	return {
		chainId: BASE_SEPOLIA_CHAIN_ID,
		symbol: asset.symbol,
		name: asset.name,
		icon: `/tokens/${asset.symbol}.png`,
		decimals: 18,
		tokenClass: "stock",
		assetClass: "us_equity",
	};
}


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
		staleTime: 1000 * 60 * 60,
		refetchOnWindowFocus: false,
		retry: 2,
	});
}
