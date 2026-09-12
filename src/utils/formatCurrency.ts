export const RUPEES_PER_LAKH = 100_000;

/** Formats a plain rupee amount with Indian digit grouping, e.g. 235000 -> "₹2,35,000". */
export function formatRupees(rupees: number): string {
  return `₹${Math.round(rupees).toLocaleString("en-IN")}`;
}

/** Converts a ₹ Lakhs amount (this app's internal storage unit) to plain rupees. */
export function lakhsToRupees(lakhs: number): number {
  return lakhs * RUPEES_PER_LAKH;
}
