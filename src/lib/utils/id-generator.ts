/**
 * Generates custom Saiha customer IDs: 003FNF001, 003FNF002, etc.
 */
export function generateCustomerId(lastNumber: number): string {
  const nextNum = (lastNumber + 1).toString().padStart(3, '0');
  return `003FNF${nextNum}`;
}

export function generateTicketId(lastNumber: number): string {
  const nextNum = (lastNumber + 1).toString().padStart(4, '0');
  return `FNF-TICK-${nextNum}`;
}
