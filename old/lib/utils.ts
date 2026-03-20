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
 * This is complementary to viem's formatUnits - use this for already-human numbers.
 */
export function formatDecimal(
	value: number,
	displayDecimals = 2,
	locale?: string,
): string {
	if (!Number.isFinite(value) || Number.isNaN(value)) return "0";
	return value.toLocaleString(locale, {
		minimumFractionDigits: displayDecimals,
		maximumFractionDigits: displayDecimals,
	});
}

/**
 * Formats a number to a specified number of significant figures.
 * Example: formatSignificantFigures(0.123456, 3) -> "0.123"
 * Example: formatSignificantFigures(1234.56, 3) -> "1,230"
 */
export function formatSignificantFigures(
	value: number,
	sigFigs = 5,
	locale?: string,
): string {
	if (!Number.isFinite(value) || Number.isNaN(value) || value === 0) return "0";
	
	// Use toPrecision for significant figures, then format with locale
	const precision = value.toPrecision(sigFigs);
	const num = Number(precision);
	
	// For very small or very large numbers, return scientific notation
	if (Math.abs(num) < 0.0001 || Math.abs(num) >= 1000000) {
		return num.toExponential(sigFigs - 1);
	}
	
	// Otherwise, use locale formatting
	return num.toLocaleString(locale);
}
