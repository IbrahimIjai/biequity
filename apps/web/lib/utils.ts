import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatUnits } from "viem";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

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

export function formatSignificantFigures(
	value: number,
	sigFigs = 5,
	locale?: string,
): string {
	if (!Number.isFinite(value) || Number.isNaN(value) || value === 0) return "0";

	const precision = value.toPrecision(sigFigs);
	const num = Number(precision);

	if (Math.abs(num) < 0.0001 || Math.abs(num) >= 1000000) {
		return num.toExponential(sigFigs - 1);
	}

	return num.toLocaleString(locale);
}
