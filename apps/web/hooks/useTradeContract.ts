import { useState, useEffect, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { BIEQUITY_CORE_CONTRACT_ADDRESS } from "@/config/biequity-core-contract";
import { BIEQUITY_CORE_ABI } from "@/config/abi/biequity_core";

export interface TradeParams {
	symbol: string;
	amount: string;
	decimals?: number;
}

export interface UseTradeContractResult {
	buyStock: (params: TradeParams) => Promise<void>;
	redeemStock: (params: TradeParams) => Promise<void>;
	isLoading: boolean;
	isPending: boolean;
	isConfirming: boolean;
	hash?: `0x${string}`;
	error: Error | null;
}

export function useTradeContract(): UseTradeContractResult {
	const [isConfirming, setIsConfirming] = useState(false);

	const {
		writeContract,
		data: hash,
		isPending: isWritePending,
		error: writeError,
	} = useWriteContract();

	const {
		isLoading: isConfirmationPending,
		isSuccess: isConfirmed,
		error: confirmationError,
	} = useWaitForTransactionReceipt({
		hash,
	});

	const isLoading = isWritePending || isConfirmationPending || isConfirming;
	const error = (writeError || confirmationError || null) as Error | null;

	const buyStock = useCallback(
		async ({ symbol, amount, decimals = 6 }: TradeParams) => {
			try {
				setIsConfirming(true);
				const usdcAmount = parseUnits(amount, decimals);

				await writeContract({
					address: BIEQUITY_CORE_CONTRACT_ADDRESS,
					abi: BIEQUITY_CORE_ABI,
					functionName: "buy",
					args: [symbol, usdcAmount],
				});
			} catch (error: any) {
				console.error("Buy transaction failed:", error);
				setIsConfirming(false);
				throw error;
			}
		},
		[writeContract],
	);

	const redeemStock = useCallback(
		async ({ symbol, amount, decimals = 18 }: TradeParams) => {
			try {
				setIsConfirming(true);
				const tokenAmount = parseUnits(amount, decimals);

				await writeContract({
					address: BIEQUITY_CORE_CONTRACT_ADDRESS,
					abi: BIEQUITY_CORE_ABI,
					functionName: "redeem" as any,
					args: [symbol, tokenAmount],
				});
			} catch (error: any) {
				console.error("Redeem transaction failed:", error);
				setIsConfirming(false);
				throw error;
			}
		},
		[writeContract],
	);

	useEffect(() => {
		if (isConfirmed && hash) {
			setIsConfirming(false);
		}

		if ((writeError || confirmationError) && isConfirming) {
			setIsConfirming(false);
		}
	}, [isConfirmed, writeError, confirmationError, hash, isConfirming]);

	return {
		buyStock,
		redeemStock,
		isLoading,
		isPending: isWritePending,
		isConfirming: isConfirmationPending,
		hash,
		error,
	};
}
