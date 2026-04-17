import { formatInr, formatInrWithDecimals } from '@/lib/currency';

interface CurrencyDisplayProps {
  amount: number;
  decimals?: number;
  className?: string;
}

/**
 * Display amount formatted as Indian Rupees with ₹ symbol
 */
export function CurrencyDisplay({
  amount,
  decimals,
  className = '',
}: CurrencyDisplayProps) {
  const formatted = decimals !== undefined ? 
    formatInrWithDecimals(amount, decimals) : 
    formatInr(amount);

  return <span className={className}>{formatted}</span>;
}
