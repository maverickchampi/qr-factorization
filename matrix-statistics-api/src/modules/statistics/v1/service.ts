import type { MatrixStatsResult } from "./entities.ts";
import type { QRMatricesInput } from "./schemas.ts";

/**
 * Checks if a matrix is diagonal.
 *
 * A matrix is considered diagonal when all elements outside the main diagonal
 * are equal to 0. The check is performed by comparing indices: an element
 * `(i, j)` belongs to the main diagonal only when `i === j`. Any element with
 * `i !== j` that is not 0 makes the matrix non-diagonal.
 *
 * @param matrix - A two-dimensional numeric array (rectangular or square).
 * @returns `true` if the matrix is diagonal, `false` otherwise.
 */
const checkIsDiagonal = (matrix: number[][]): boolean => {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (i !== j && matrix[i][j] !== 0) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Computes global statistics from two numeric matrices.
 *
 * This function belongs to the Service layer (business logic) and operates
 * on pre-validated input. It extracts all values from matrices `q` and `r`,
 * computes global statistics (maximum, minimum, average, and total sum),
 * and dynamically determines whether each matrix is diagonal by iterating
 * over indices with the condition `i === j`.
 *
 * @param data - The input object containing the two matrices to analyze.
 * @param data.q - A two-dimensional numeric array (rectangular or square).
 * @param data.r - A two-dimensional numeric array (rectangular or square).
 * @returns An object containing the computed statistics and diagonal flags
 *          for each matrix.
 */
export const computeMatrixStats = (data: QRMatricesInput): MatrixStatsResult => {
  const { q, r } = data;

  const values = [...q.flat(), ...r.flat()];

  const sum = values.reduce((sum, val) => sum + val, 0);
  const average = sum / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  return {
    max,
    min,
    average,
    sum,
    length: values.length,
    isDiagonal: {
      q: checkIsDiagonal(q),
      r: checkIsDiagonal(r)
    }
  };
};
