import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { BIEQUITY_CORE_CONTRACT_ADDRESS } from "@/config/biequity-core-contract";
import { BIEQUITY_CORE_ABI } from "@/config/abi/biequity_core";
import { toast } from "sonner";

export interface TradeParams {
	symbol: string;
	amount: string;
	decimals?: number;
}

export function useTradeContract() {
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

	// Combined loading state
	const isLoading = isWritePending || isConfirmationPending || isConfirming;

	// Buy stock tokens with USDC
	const buyStock = async ({ symbol, amount, decimals = 6 }: TradeParams) => {
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
			throw error; // Re-throw for dialog to handle
		}
	};

	// Redeem stock tokens for USDC
	const redeemStock = async ({
		symbol,
		amount,
		decimals = 18,
	}: TradeParams) => {
		try {
			setIsConfirming(true);
			const tokenAmount = parseUnits(amount, decimals);

			await writeContract({
				address: BIEQUITY_CORE_CONTRACT_ADDRESS,
				abi: BIEQUITY_CORE_ABI,
				functionName: "redeem" as any, // Cast to any until ABI is updated
				args: [symbol, tokenAmount],
			});
		} catch (error: any) {
			console.error("Redeem transaction failed:", error);
			setIsConfirming(false);
			throw error; // Re-throw for dialog to handle
		}
	};

	// Handle transaction confirmation
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
		error: writeError || confirmationError,
	};
}
