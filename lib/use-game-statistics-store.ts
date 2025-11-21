import { create } from "zustand";
import type { HandOutcome } from "./use-deck-store";

interface GameStatisticsStore {
  totalIterations: number;
  dealerWins: number;
  playerWins: number;
  ties: number;
  updateGameStatistics: (handOutcomes: Map<number, HandOutcome>) => void;
  resetGameStatistics: () => void;
}

export const useGameStatisticsStore = create<GameStatisticsStore>((set) => ({
  totalIterations: 0,
  dealerWins: 0,
  playerWins: 0,
  ties: 0,

  updateGameStatistics: (handOutcomes: Map<number, HandOutcome>) => {
    set((state) => {
      if (handOutcomes.size === 0) {
        return state;
      }

      let playerWinCount = 0;
      let dealerWinCount = 0;
      let tieCount = 0;

      handOutcomes.forEach((outcome) => {
        if (outcome === null) return;

        if (outcome === "player-wins" || outcome === "dealer-busts") {
          playerWinCount += 1;
        } else if (outcome === "dealer-wins" || outcome === "player-busts") {
          dealerWinCount += 1;
        } else if (outcome === "tie") {
          tieCount += 1;
        }
      });

      let gameResult: "player" | "dealer" | "tie" | null = null;

      if (tieCount > 0 && playerWinCount === 0 && dealerWinCount === 0) {
        gameResult = "tie";
      } else if (playerWinCount > dealerWinCount) {
        gameResult = "player";
      } else if (dealerWinCount > playerWinCount) {
        gameResult = "dealer";
      } else if (playerWinCount > 0 && dealerWinCount === 0) {
        gameResult = "player";
      } else if (dealerWinCount > 0 && playerWinCount === 0) {
        gameResult = "dealer";
      } else if (playerWinCount === dealerWinCount && tieCount > 0) {
        gameResult = "tie";
      } else if (playerWinCount > 0) {
        gameResult = "player";
      } else if (dealerWinCount > 0) {
        gameResult = "dealer";
      }

      if (gameResult === null) {
        return state;
      }

      return {
        totalIterations: state.totalIterations + 1,
        dealerWins: state.dealerWins + (gameResult === "dealer" ? 1 : 0),
        playerWins: state.playerWins + (gameResult === "player" ? 1 : 0),
        ties: state.ties + (gameResult === "tie" ? 1 : 0),
      };
    });
  },

  resetGameStatistics: () => {
    set({
      totalIterations: 0,
      dealerWins: 0,
      playerWins: 0,
      ties: 0,
    });
  },
}));
