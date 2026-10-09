export function resize(
  matrix: string[][],
  rows: number,
  cols: number
): string[][] {
  const next: string[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: string[] = [];
    for (let j = 0; j < cols; j++) row.push(matrix[i]?.[j] ?? "");
    next.push(row);
  }
  return next;
}
