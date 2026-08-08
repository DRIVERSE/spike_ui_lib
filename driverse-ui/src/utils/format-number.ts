/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/utils/format-number.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/utils/format-number.ts
 * @status merged
 * @notes The numeral-based helpers (fNumber/fCurrency/fPercent/fShortenNumber/fBytes/result) and
 *        `formatAmount` are byte-identical. Union of the rest: A contributes
 *        `formatAmountWithCurrency` plus its currency-symbol map, B contributes `formatNumberWithCommas`.
 *        Dropped: both apps' `getCurrencySymbol`, a two-line hack returning "MXN" or "$" that contradicts
 *        A's 17-currency map — call `formatAmountWithCurrency` instead. B's commented-out earlier
 *        `formatAmount` draft is not carried over.
 *        https://numeraljs.com/
 */

import numeral from "numeral";

type InputValue = string | number | null | undefined;

export function fNumber(number: InputValue) {
	return numeral(number).format();
}

export function fCurrency(number: InputValue) {
	const format = number ? numeral(number).format("$0,0.00") : "";

	return result(format, ".00");
}

export function fPercent(number: InputValue) {
	const format = number ? numeral(Number(number) / 100).format("0.0%") : "";

	return result(format, ".0");
}

export function fShortenNumber(number: InputValue) {
	const format = number ? numeral(number).format("0.00a") : "";

	return result(format, ".00");
}

export function fBytes(number: InputValue) {
	const format = number ? numeral(number).format("0.0 b") : "";

	return result(format, ".0");
}

function result(format: string, key = ".00") {
	const isInteger = format.includes(key);

	return isInteger ? format.replace(key, "") : format;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
	USD: "$",
	EUR: "€",
	GBP: "£",
	JPY: "¥",
	CNY: "¥",
	KRW: "₩",
	INR: "₹",
	CAD: "C$",
	AUD: "A$",
	CHF: "Fr",
	SEK: "kr",
	NOK: "kr",
	DKK: "kr",
	RUB: "₽",
	BRL: "R$",
	MXN: "$",
	ZAR: "R",
};

export function formatAmountWithCurrency(amount: number | string, currency = "USD", decimals = 2) {
	const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? currency;
	const numericAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount;

	if (Number.isNaN(numericAmount)) {
		return `${symbol}0`;
	}

	const decimalFormat = decimals > 0 ? `.${"0".repeat(decimals)}` : "";
	const format = `0,0${decimalFormat}`;
	const formatted = numeral(numericAmount).format(format);

	return `${symbol}${formatted}`;
}

export const formatNumberWithCommas = (value: string | number) => {
	const numValue = typeof value === "string" ? Number.parseFloat(value) : value;
	if (Number.isNaN(numValue)) return "0";
	return numValue.toLocaleString("en-US");
};

export const formatAmount = (amount: number | string, currency?: string): string => {
	if (amount === null || amount === undefined || amount === "") {
		return "0.00";
	}

	const numericAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount;

	if (Number.isNaN(numericAmount)) {
		return "0.00";
	}

	// Format with thousands separator
	const formatted = Math.abs(numericAmount)
		.toFixed(2)
		.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

	// If negative, prepend minus before currency
	if (numericAmount < 0 && currency) {
		return `${formatted}`;
	}

	// If positive, normal order
	return currency ? `${formatted}` : formatted;
};
