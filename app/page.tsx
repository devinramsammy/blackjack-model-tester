"use client";

import { useEffect } from "react";
import { BlackjackTable } from "@/components/blackjack-table";
import { useDeckStore } from "@/lib/use-deck-store";
import { useBalanceStore } from "@/lib/use-balance-store";
import { Slider } from "@/components/ui/slider";
import { BalanceHistoryChart } from "@/components/balance-history-chart";

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
          <div className="flex items-center gap-4 px-4 py-2 bg-muted text-muted-foreground rounded">
            <label className="text-sm font-medium whitespace-nowrap w-24">
              Bet: ${betValue}
            </label>
            <div className="w-48 flex-shrink-0">
              <Slider
                value={[betValue]}
                onValueChange={(values) => handleBetChange(values[0])}
                min={1}
                max={Math.min(1000, balance)}
                step={1}
              />
            </div>
          </div>
        </div>
        <div className="mb-6">
          <BalanceHistoryChart />
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
