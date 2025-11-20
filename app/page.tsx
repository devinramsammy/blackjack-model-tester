"use client";

import { useEffect, useState } from "react";
import { BlackjackTable } from "@/components/blackjack-table";
import { useDeckStore } from "@/lib/use-deck-store";
import { useBalanceStore } from "@/lib/use-balance-store";
import { Slider } from "@/components/ui/slider";
import { BalanceHistoryChart } from "@/components/balance-history-chart";
import { predictAction } from "@/lib/model-utils";

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
    addCardToPlayer,
    stand,
  } = useDeckStore();

  const balance = useBalanceStore((state) => state.balance);
  const betValue = useBalanceStore((state) => state.betValue);
  const setBetValue = useBalanceStore((state) => state.setBetValue);

  const [isAutoplayActive, setIsAutoplayActive] = useState(false);
  const [previousGameState, setPreviousGameState] =
    useState<typeof gameState>(gameState);

  useEffect(() => {
    initializeDeck(1);
  }, [initializeDeck]);

  useEffect(() => {
    if (!isAutoplayActive) {
      setPreviousGameState(gameState);
      return;
    }

    if (gameState === "game-over" && previousGameState !== "game-over") {
      setTimeout(() => {
        clearCards();
        initializeDeck(1);
        setTimeout(() => {
          initializeHands();
        }, 250);
      }, 250);

      setPreviousGameState(gameState);
    }

    setPreviousGameState(gameState);
  }, [
    isAutoplayActive,
    gameState,
    previousGameState,
    clearCards,
    initializeDeck,
    initializeHands,
  ]);

  useEffect(() => {
    if (!isAutoplayActive) {
      return;
    }

    if (gameState !== "player-turn") {
      return;
    }

    const currentHand = playerCards[currentHandIndex];
    if (!currentHand || currentHand.length === 0) {
      return;
    }

    const hasStood = stoodOnHands.has(currentHandIndex);
    const hasOutcome = handOutcomes.has(currentHandIndex);

    if (hasStood || hasOutcome) {
      return;
    }

    const action = predictAction(currentHand);

    const executeAction = () => {
      if (action === "HIT") {
        addCardToPlayer(currentHandIndex);
      } else if (action === "STAND") {
        stand(currentHandIndex);
      }
    };

    const timeoutId = setTimeout(() => {
      executeAction();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    isAutoplayActive,
    gameState,
    playerCards,
    currentHandIndex,
    stoodOnHands,
    handOutcomes,
    addCardToPlayer,
    stand,
  ]);

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

  const handleStartAutoplay = () => {
    setIsAutoplayActive(true);
    if (playerCards.length === 0 || playerCards[0].length === 0) {
      handleClearTable();
    }
  };

  const handleStopAutoplay = () => {
    setIsAutoplayActive(false);
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
          {!isAutoplayActive ? (
            <button
              onClick={handleStartAutoplay}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Start
            </button>
          ) : (
            <button
              onClick={handleStopAutoplay}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
            >
              Stop
            </button>
          )}
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
