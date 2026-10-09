export interface MatrixStatsResult {
  max: number;
  min: number;
  average: number;
  sum: number;
  length: number;
  isDiagonal: {
    q: boolean;
    r: boolean;
  };
}
