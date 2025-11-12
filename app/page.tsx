"use client";

import { useEffect } from "react";
import { BlackjackTable } from "@/components/blackjack-table";
import { useDeckStore } from "@/lib/use-deck-store";
import { useBalanceStore } from "@/lib/use-balance-store";

export default function Home() {
  const {
    playerCards,
    dealerCards,
    gameState,
    currentHandIndex,
    stoodOnHands,
    handOutcomes,
    initializeDeck,
    clearCards,
    initializeHands,
  } = useDeckStore();

  const balance = useBalanceStore((state) => state.balance);
  const betValue = useBalanceStore((state) => state.betValue);
  const setBetValue = useBalanceStore((state) => state.setBetValue);

  useEffect(() => {
    initializeDeck(1);
  }, [initializeDeck]);

  const handleClearTable = () => {
    clearCards();
    initializeDeck(1);

    setTimeout(() => {
      initializeHands();
    }, 250);
  };

  const handleBetChange = (value: number) => {
    setBetValue(value);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto py-8 px-4">
        <div className="mb-4 flex gap-4 flex-wrap items-center">
          <button
            onClick={handleClearTable}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
          >
            Clear Table
          </button>
          <div className="px-4 py-2 bg-muted text-muted-foreground rounded">
            Balance: ${balance}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded">
            <label
              htmlFor="bet-input"
              className="text-sm font-medium whitespace-nowrap"
            >
              Bet: $
            </label>
            <input
              id="bet-input"
              type="number"
              min="1"
              max="1000"
              step="1"
              value={betValue}
              onChange={(e) => handleBetChange(Number(e.target.value) || 0)}
              className="w-20 px-2 py-1 bg-background border border-border rounded text-sm"
            />
          </div>
        </div>
        <BlackjackTable
          dealerCards={dealerCards}
          playerCards={playerCards}
          gameState={gameState}
          currentHandIndex={currentHandIndex}
          stoodOnHands={stoodOnHands}
          handOutcomes={handOutcomes}
        />
      </main>
    </div>
  );
}
