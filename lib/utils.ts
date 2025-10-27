import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatUnits } from "viem";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Formats a blockchain base-units amount into a human-readable decimal string.
 * Example: value=428714280n, baseDecimals=6, displayDecimals=2 -> "428.71".
 */
export function formatFromBaseUnits(
	value: bigint | number | string,
	baseDecimals: number,
	displayDecimals = 2,
	locale?: string,
): string {
	let asBigInt: bigint;
	if (typeof value === "bigint") asBigInt = value;
	else if (typeof value === "number") asBigInt = BigInt(Math.trunc(value));
	else asBigInt = BigInt(value);

	const human = Number(formatUnits(asBigInt, baseDecimals));
	if (!Number.isFinite(human)) return "0";
	return human.toLocaleString(locale, {
		minimumFractionDigits: displayDecimals,
		maximumFractionDigits: displayDecimals,
	});
}

/**
 * Formats a JS number to a string with fixed fraction digits.
 */
export function formatDecimal(
	value: number,
	displayDecimals = 2,
	locale?: string,
): string {
	if (!Number.isFinite(value)) return "0";
	return value.toLocaleString(locale, {
		minimumFractionDigits: displayDecimals,
		maximumFractionDigits: displayDecimals,
	});
}
