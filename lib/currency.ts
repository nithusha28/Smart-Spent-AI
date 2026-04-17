// Currency conversion utilities for Indian Rupees (INR)

// Conversion rate: 1 USD = 83 INR (approximate, update as needed)
export const USD_TO_INR_RATE = 83;

/**
 * Convert USD to INR
 * @param usd Amount in US Dollars
 * @returns Amount in Indian Rupees
 */
export function usdToInr(usd: number): number {
  return Math.round(usd * USD_TO_INR_RATE);
}

/**
 * Format amount as Indian Rupees with ₹ symbol
 * @param amount Amount in rupees
 * @returns Formatted string (e.g., "₹10,000")
 */
export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format amount as Indian Rupees with decimal places
 * @param amount Amount in rupees
 * @param decimals Number of decimal places (default 2)
 * @returns Formatted string (e.g., "₹10,000.50")
 */
export function formatInrWithDecimals(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Parse formatted INR string back to number
 * @param formatted Formatted string (e.g., "₹10,000")
 * @returns Number value
 */
export function parseInr(formatted: string): number {
  return parseInt(formatted.replace(/[^0-9]/g, ''), 10) || 0;
}

/**
 * Get INR symbol
 * @returns "₹"
 */
export function getInrSymbol(): string {
  return '₹';
}

/**
 * Convert and format in one step
 * @param usd Amount in USD
 * @returns Formatted INR string
 */
export function convertAndFormatInr(usd: number): string {
  const inr = usdToInr(usd);
  return formatInr(inr);
}
