import { describe, expect, it } from "vitest";
import { computeMatrixStats } from "./service.ts";

describe("computeMatrixStats", () => {
  it("should compute basic stats for simple matrices", () => {
    const input = {
      q: [
        [1, 2],
        [3, 4]
      ],
      r: [
        [5, 6],
        [7, 8]
      ]
    };

    const result = computeMatrixStats(input);

    expect(result.sum).toBe(36);
    expect(result.average).toBe(4.5);
    expect(result.max).toBe(8);
    expect(result.min).toBe(1);
  });

  it("should detect diagonal matrices correctly", () => {
    const diagonal = {
      q: [
        [5, 0],
        [0, 3]
      ],
      r: [
        [1, 0],
        [0, 2]
      ]
    };

    const result = computeMatrixStats(diagonal);
    expect(result.isDiagonal.q).toBe(true);
    expect(result.isDiagonal.r).toBe(true);
  });

  it("should detect non-diagonal matrices correctly", () => {
    const nonDiagonal = {
      q: [
        [1, 2],
        [0, 3]
      ],
      r: [
        [1, 0],
        [0, 2]
      ]
    };

    const result = computeMatrixStats(nonDiagonal);
    expect(result.isDiagonal.q).toBe(false);
    expect(result.isDiagonal.r).toBe(true);
  });

  it("should handle negative numbers", () => {
    const input = {
      q: [[-1, -2]],
      r: [[3, 4]]
    };

    const result = computeMatrixStats(input);
    expect(result.sum).toBe(4);
    expect(result.min).toBe(-2);
    expect(result.max).toBe(4);
    expect(result.average).toBe(1);
  });

  it("should handle zeros and floating point numbers", () => {
    const input = {
      q: [
        [0.5, 0],
        [0, 0.5]
      ],
      r: [[0, 0]]
    };

    const result = computeMatrixStats(input);
    expect(result.sum).toBe(1);
    expect(result.average).toBeCloseTo(0.1667, 4);
    expect(result.max).toBe(0.5);
    expect(result.min).toBe(0);
    expect(result.isDiagonal.q).toBe(true);
    expect(result.isDiagonal.r).toBe(true);
  });

  it("should handle single element matrices", () => {
    const input = {
      q: [[10]],
      r: [[20]]
    };

    const result = computeMatrixStats(input);
    expect(result.sum).toBe(30);
    expect(result.average).toBe(15);
    expect(result.max).toBe(20);
    expect(result.min).toBe(10);
    expect(result.isDiagonal.q).toBe(true);
    expect(result.isDiagonal.r).toBe(true);
  });
});
