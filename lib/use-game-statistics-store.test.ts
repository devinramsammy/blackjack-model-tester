import { describe, it, expect, beforeEach } from "vitest";
import { useGameStatisticsStore } from "./use-game-statistics-store";
import type { HandOutcome } from "./use-deck-store";

describe("useGameStatisticsStore", () => {
  beforeEach(() => {
    useGameStatisticsStore.getState().resetGameStatistics();
  });

  describe("Initial State", () => {
    it("should have all initial values set to 0", () => {
      const state = useGameStatisticsStore.getState();
      expect(state.totalIterations).toBe(0);
      expect(state.dealerWins).toBe(0);
      expect(state.playerWins).toBe(0);
      expect(state.ties).toBe(0);
    });
  });

  describe("updateGameStatistics", () => {
    it("should not update statistics when handOutcomes is empty", () => {
      const initialState = useGameStatisticsStore.getState();
      const emptyMap = new Map<number, HandOutcome>();

      useGameStatisticsStore.getState().updateGameStatistics(emptyMap);

      const state = useGameStatisticsStore.getState();
      expect(state.totalIterations).toBe(initialState.totalIterations);
      expect(state.dealerWins).toBe(initialState.dealerWins);
      expect(state.playerWins).toBe(initialState.playerWins);
      expect(state.ties).toBe(initialState.ties);
    });

    it("should increment playerWins when player wins a single hand", () => {
      const handOutcomes = new Map<number, HandOutcome>([[0, "player-wins"]]);

      useGameStatisticsStore.getState().updateGameStatistics(handOutcomes);

      const state = useGameStatisticsStore.getState();
      expect(state.totalIterations).toBe(1);
      expect(state.playerWins).toBe(1);
      expect(state.dealerWins).toBe(0);
      expect(state.ties).toBe(0);
    });

    it("should increment playerWins when dealer busts", () => {
      const handOutcomes = new Map<number, HandOutcome>([[0, "dealer-busts"]]);

      useGameStatisticsStore.getState().updateGameStatistics(handOutcomes);

      const state = useGameStatisticsStore.getState();
      expect(state.totalIterations).toBe(1);
      expect(state.playerWins).toBe(1);
      expect(state.dealerWins).toBe(0);
      expect(state.ties).toBe(0);
    });

    it("should increment dealerWins when dealer wins a single hand", () => {
      const handOutcomes = new Map<number, HandOutcome>([[0, "dealer-wins"]]);

      useGameStatisticsStore.getState().updateGameStatistics(handOutcomes);

      const state = useGameStatisticsStore.getState();
      expect(state.totalIterations).toBe(1);
      expect(state.dealerWins).toBe(1);
      expect(state.playerWins).toBe(0);
      expect(state.ties).toBe(0);
    });

    it("should increment dealerWins when player busts", () => {
      const handOutcomes = new Map<number, HandOutcome>([[0, "player-busts"]]);

      useGameStatisticsStore.getState().updateGameStatistics(handOutcomes);

      const state = useGameStatisticsStore.getState();
      expect(state.totalIterations).toBe(1);
      expect(state.dealerWins).toBe(1);
      expect(state.playerWins).toBe(0);
      expect(state.ties).toBe(0);
    });

    it("should increment ties when there is a tie", () => {
      const handOutcomes = new Map<number, HandOutcome>([[0, "tie"]]);

      useGameStatisticsStore.getState().updateGameStatistics(handOutcomes);

      const state = useGameStatisticsStore.getState();
      expect(state.totalIterations).toBe(1);
      expect(state.ties).toBe(1);
      expect(state.playerWins).toBe(0);
      expect(state.dealerWins).toBe(0);
    });

    it("should ignore null outcomes", () => {
      const handOutcomes = new Map<number, HandOutcome>([[0, null]]);

      const initialState = useGameStatisticsStore.getState();
      useGameStatisticsStore.getState().updateGameStatistics(handOutcomes);

      const state = useGameStatisticsStore.getState();
      expect(state.totalIterations).toBe(initialState.totalIterations);
      expect(state.dealerWins).toBe(initialState.dealerWins);
      expect(state.playerWins).toBe(initialState.playerWins);
      expect(state.ties).toBe(initialState.ties);
    });

    it("should handle multiple hands with player winning more", () => {
      const handOutcomes = new Map<number, HandOutcome>([
        [0, "player-wins"],
        [1, "player-wins"],
        [2, "dealer-wins"],
      ]);

      useGameStatisticsStore.getState().updateGameStatistics(handOutcomes);

      const state = useGameStatisticsStore.getState();
      expect(state.totalIterations).toBe(1);
      expect(state.playerWins).toBe(1);
      expect(state.dealerWins).toBe(0);
      expect(state.ties).toBe(0);
    });

    it("should handle multiple hands with dealer winning more", () => {
      const handOutcomes = new Map<number, HandOutcome>([
        [0, "dealer-wins"],
        [1, "dealer-wins"],
        [2, "player-wins"],
      ]);

      useGameStatisticsStore.getState().updateGameStatistics(handOutcomes);

      const state = useGameStatisticsStore.getState();
      expect(state.totalIterations).toBe(1);
      expect(state.dealerWins).toBe(1);
      expect(state.playerWins).toBe(0);
      expect(state.ties).toBe(0);
    });

    it("should handle multiple hands with equal wins and ties", () => {
      const handOutcomes = new Map<number, HandOutcome>([
        [0, "player-wins"],
        [1, "dealer-wins"],
        [2, "tie"],
      ]);

      useGameStatisticsStore.getState().updateGameStatistics(handOutcomes);

      const state = useGameStatisticsStore.getState();
      expect(state.totalIterations).toBe(1);
      expect(state.ties).toBe(1);
      expect(state.playerWins).toBe(0);
      expect(state.dealerWins).toBe(0);
    });

    it("should accumulate statistics across multiple updates", () => {
      useGameStatisticsStore
        .getState()
        .updateGameStatistics(
          new Map<number, HandOutcome>([[0, "player-wins"]])
        );
      useGameStatisticsStore
        .getState()
        .updateGameStatistics(
          new Map<number, HandOutcome>([[0, "dealer-wins"]])
        );
      useGameStatisticsStore
        .getState()
        .updateGameStatistics(new Map<number, HandOutcome>([[0, "tie"]]));
      useGameStatisticsStore
        .getState()
        .updateGameStatistics(
          new Map<number, HandOutcome>([[0, "player-wins"]])
        );

      const state = useGameStatisticsStore.getState();
      expect(state.totalIterations).toBe(4);
      expect(state.playerWins).toBe(2);
      expect(state.dealerWins).toBe(1);
      expect(state.ties).toBe(1);
    });

    it("should handle equal player and dealer wins (defaults to player)", () => {
      const handOutcomes = new Map<number, HandOutcome>([
        [0, "player-wins"],
        [1, "dealer-busts"],
        [2, "dealer-wins"],
        [3, "player-busts"],
      ]);

      useGameStatisticsStore.getState().updateGameStatistics(handOutcomes);

      const state = useGameStatisticsStore.getState();
      expect(state.totalIterations).toBe(1);
      // When wins are equal, the logic defaults to player (line 55-56 in implementation)
      expect(state.playerWins).toBe(1);
      expect(state.dealerWins).toBe(0);
      expect(state.ties).toBe(0);
    });
  });

  describe("resetGameStatistics", () => {
    it("should reset all statistics to initial values", () => {
      useGameStatisticsStore
        .getState()
        .updateGameStatistics(
          new Map<number, HandOutcome>([[0, "player-wins"]])
        );
      useGameStatisticsStore
        .getState()
        .updateGameStatistics(
          new Map<number, HandOutcome>([[0, "dealer-wins"]])
        );
      useGameStatisticsStore
        .getState()
        .updateGameStatistics(new Map<number, HandOutcome>([[0, "tie"]]));

      useGameStatisticsStore.getState().resetGameStatistics();

      const state = useGameStatisticsStore.getState();
      expect(state.totalIterations).toBe(0);
      expect(state.dealerWins).toBe(0);
      expect(state.playerWins).toBe(0);
      expect(state.ties).toBe(0);
    });

    it("should allow statistics to be updated after reset", () => {
      useGameStatisticsStore
        .getState()
        .updateGameStatistics(
          new Map<number, HandOutcome>([[0, "player-wins"]])
        );
      useGameStatisticsStore.getState().resetGameStatistics();

      useGameStatisticsStore
        .getState()
        .updateGameStatistics(
          new Map<number, HandOutcome>([[0, "dealer-wins"]])
        );

      const state = useGameStatisticsStore.getState();
      expect(state.totalIterations).toBe(1);
      expect(state.dealerWins).toBe(1);
      expect(state.playerWins).toBe(0);
      expect(state.ties).toBe(0);
    });
  });
});
