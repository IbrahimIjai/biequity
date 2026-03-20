export const TX_SETTLEMENT_CONFIG = {
	maxAttempts: 5,
	retryIntervalsMs: [0, 500, 1500, 3000, 5000],
	requiredConfirmations: 1,
} as const;

export type TxSettlementConfig = typeof TX_SETTLEMENT_CONFIG;
