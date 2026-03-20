import { useState, useEffect, useCallback } from "react";
import {
	useWriteContract,
	useWaitForTransactionReceipt,
	useReadContract,
} from "wagmi";
import { parseUnits, maxUint256 } from "viem";
import { BIEQUITY_CORE_CONTRACT_ADDRESS } from "@/config/biequity-core-contract";

const ERC20_ABI = [
	{
		type: "function",
		name: "approve",
		inputs: [
			{ name: "spender", type: "address" },
			{ name: "amount", type: "uint256" },
		],
		outputs: [{ name: "", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "allowance",
		inputs: [
			{ name: "owner", type: "address" },
			{ name: "spender", type: "address" },
		],
		outputs: [{ name: "", type: "uint256" }],
		stateMutability: "view",
	},
] as const;

export interface UseUSDCApprovalResult {
	approveUSDC: (amount?: string) => Promise<void>;
	needsApproval: (amount: string, decimals?: number) => boolean;
	reset: () => void;
	allowance: bigint | undefined;
	isLoading: boolean;
	isPending: boolean;
	isConfirming: boolean;
	hash?: `0x${string}`;
	error: Error | null;
	refetchAllowance: () => unknown;
}

export function useUSDCApproval(
	usdcAddress: string,
	userAddress?: string,
): UseUSDCApprovalResult {
	const [isApproving, setIsApproving] = useState(false);

	const { data: allowance, refetch: refetchAllowance } = useReadContract({
		address: usdcAddress as `0x${string}`,
		abi: ERC20_ABI,
		functionName: "allowance",
		args: userAddress
			? [userAddress as `0x${string}`, BIEQUITY_CORE_CONTRACT_ADDRESS]
			: undefined,
		query: {
			enabled: !!userAddress,
		},
	});

	const {
		writeContract,
		data: hash,
		isPending: isWritePending,
		error: writeError,
		reset: resetWriteState,
	} = useWriteContract();

	const {
		isLoading: isConfirmationPending,
		isSuccess: isConfirmed,
		error: confirmationError,
	} = useWaitForTransactionReceipt({
		hash,
	});

	const isLoading = isWritePending || isConfirmationPending || isApproving;
	const error = (writeError || confirmationError || null) as Error | null;

	const needsApproval = useCallback(
		(amount: string, decimals: number = 6) => {
			if (!allowance) return true;
			try {
				const requiredAmount = parseUnits(amount, decimals);
				return (allowance as bigint) < requiredAmount;
			} catch (e) {
				return true;
			}
		},
		[allowance],
	);

	const approveUSDC = useCallback(
		async (amount?: string) => {
			try {
				setIsApproving(true);

				const approvalAmount = amount ? parseUnits(amount, 6) : maxUint256;

				await writeContract({
					address: usdcAddress as `0x${string}`,
					abi: ERC20_ABI,
					functionName: "approve",
					args: [BIEQUITY_CORE_CONTRACT_ADDRESS, approvalAmount],
				});
			} catch (error: any) {
				console.error("Approval failed:", error);
				setIsApproving(false);
				throw error;
			}
		},
		[usdcAddress, writeContract],
	);

	useEffect(() => {
		if (isConfirmed && hash) {
			setIsApproving(false);
			refetchAllowance();
		}

		if ((writeError || confirmationError) && isApproving) {
			setIsApproving(false);
		}
	}, [
		isConfirmed,
		writeError,
		confirmationError,
		hash,
		isApproving,
		refetchAllowance,
	]);

	const reset = useCallback(() => {
		setIsApproving(false);
		resetWriteState();
	}, [resetWriteState]);

	return {
		approveUSDC,
		needsApproval,
		reset,
		allowance,
		isLoading,
		isPending: isWritePending,
		isConfirming: isConfirmationPending,
		hash,
		error,
		refetchAllowance,
	};
}
