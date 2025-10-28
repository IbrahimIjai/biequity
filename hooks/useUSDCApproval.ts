import { useState, useEffect } from "react";
import {
	useWriteContract,
	useWaitForTransactionReceipt,
	useReadContract,
} from "wagmi";
import { parseUnits, maxUint256 } from "viem";
import { BIEQUITY_CORE_CONTRACT_ADDRESS } from "@/config/biequity-core-contract";
import { toast } from "sonner";

// Standard ERC20 ABI for approve and allowance
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

export function useUSDCApproval(usdcAddress: string, userAddress?: string) {
	const [isApproving, setIsApproving] = useState(false);

	// Check current allowance
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
	} = useWriteContract();

	const {
		isLoading: isConfirmationPending,
		isSuccess: isConfirmed,
		error: confirmationError,
	} = useWaitForTransactionReceipt({
		hash,
	});

	const isLoading = isWritePending || isConfirmationPending || isApproving;

	// Check if approval is needed
	const needsApproval = (amount: string, decimals: number = 6) => {
		if (!allowance) return true;
		const requiredAmount = parseUnits(amount, decimals);
		return allowance < requiredAmount;
	};

	// Approve USDC spending
	const approveUSDC = async (amount?: string) => {
		try {
			setIsApproving(true);

			// Use max approval for better UX (user won't need to approve again)
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
			throw error; // Re-throw for dialog to handle
		}
	};

	// Handle approval confirmation
	useEffect(() => {
		if (isConfirmed && hash) {
			setIsApproving(false);
			refetchAllowance(); // Refresh allowance after approval
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

	return {
		approveUSDC,
		needsApproval,
		allowance,
		isLoading,
		isPending: isWritePending,
		isConfirming: isConfirmationPending,
		hash,
		error: writeError || confirmationError,
		refetchAllowance,
	};
}
