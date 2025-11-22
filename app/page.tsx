"use client";

import { useEffect, useState } from "react";
import { BlackjackTable } from "@/components/blackjack-table";
import { useDeckStore } from "@/lib/use-deck-store";
import { useBalanceStore } from "@/lib/use-balance-store";
import { useGameStatisticsStore } from "@/lib/use-game-statistics-store";
import { Slider } from "@/components/ui/slider";
import { BalanceHistoryChart } from "@/components/balance-history-chart";
import { predictAction } from "@/lib/model-utils";
import { getAvailablePlayerMoves } from "@/lib/deck-utils";

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
    splitHand,
    setBet,
    getBet,
    resetGameState,
    speedMultiplier,
    setSpeedMultiplier,
  } = useDeckStore();

  const balance = useBalanceStore((state) => state.balance);
  const betValue = useBalanceStore((state) => state.betValue);
  const setBetValue = useBalanceStore((state) => state.setBetValue);
  const resetBalance = useBalanceStore((state) => state.resetBalance);
  const resetBalanceHistory = useBalanceStore(
    (state) => state.resetBalanceHistory
  );
  const resetBetValue = useBalanceStore((state) => state.resetBetValue);
  const totalIterations = useGameStatisticsStore(
    (state) => state.totalIterations
  );
  const dealerWins = useGameStatisticsStore((state) => state.dealerWins);
  const playerWins = useGameStatisticsStore((state) => state.playerWins);
  const ties = useGameStatisticsStore((state) => state.ties);
  const updateGameStatistics = useGameStatisticsStore(
    (state) => state.updateGameStatistics
  );
  const resetGameStatistics = useGameStatisticsStore(
    (state) => state.resetGameStatistics
  );

  const [isAutoplayActive, setIsAutoplayActive] = useState(false);
  const [previousGameState, setPreviousGameState] =
    useState<typeof gameState>(gameState);
  const [temperature, setTemperature] = useState(0.0);

  useEffect(() => {
    initializeDeck(1);
    initializeHands();
  }, [initializeDeck]);

  useEffect(() => {
    if (betValue > balance) {
      setBetValue(Math.max(0, balance));
    } else if (betValue < 0) {
      setBetValue(0);
    }
  }, [balance, betValue, setBetValue]);

  useEffect(() => {
    if (balance === 0 && isAutoplayActive) {
      setIsAutoplayActive(false);
    }
  }, [balance, isAutoplayActive]);

  useEffect(() => {
    if (gameState === "game-over" && previousGameState !== "game-over") {
      if (handOutcomes.size > 0) {
        updateGameStatistics(handOutcomes);
      }
    }

    setPreviousGameState(gameState);
  }, [gameState, previousGameState, handOutcomes, updateGameStatistics]);

  useEffect(() => {
    if (!isAutoplayActive) {
      return;
    }

    if (gameState === "game-over" && previousGameState !== "game-over") {
      setTimeout(() => {
        clearCards();
        initializeDeck(1);
        setTimeout(() => {
          initializeHands();
        }, 250 / speedMultiplier);
      }, 250 / speedMultiplier);
    }
  }, [
    isAutoplayActive,
    gameState,
    previousGameState,
    clearCards,
    initializeDeck,
    initializeHands,
    speedMultiplier,
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

    const dealerUpcard = dealerCards.find((card) => !card.faceDown);
    if (!dealerUpcard) {
      return;
    }

    const allowedActions = getAvailablePlayerMoves(currentHand);

    let cancelled = false;
    const executePrediction = async () => {
      try {
        const action = await predictAction(
          currentHand,
          dealerUpcard,
          allowedActions,
          temperature
        );

        if (cancelled) {
          return;
        }

        if (action === "HIT") {
          addCardToPlayer(currentHandIndex);
        } else if (action === "STAND") {
          stand(currentHandIndex);
        } else if (action === "DOUBLE" && allowedActions.includes("DOUBLE")) {
          const currentBet = getBet(currentHandIndex);
          setBet(currentHandIndex, currentBet * 2);

          addCardToPlayer(currentHandIndex);

          stand(currentHandIndex);
        } else if (action === "SPLIT" && allowedActions.includes("SPLIT")) {
          splitHand(currentHandIndex);
        }
      } catch (error) {
        console.error("Error predicting action:", error);
        if (!cancelled) {
          addCardToPlayer(currentHandIndex);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      executePrediction();
    }, 100 / speedMultiplier);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [
    isAutoplayActive,
    gameState,
    playerCards,
    dealerCards,
    currentHandIndex,
    stoodOnHands,
    handOutcomes,
    addCardToPlayer,
    stand,
    splitHand,
    temperature,
    speedMultiplier,
  ]);

  const reset = () => {
    setIsAutoplayActive(false);
    resetGameState();
    resetBalance();
    resetBalanceHistory();
    resetBetValue();
    resetGameStatistics();
    handleClearTable();
  };

  const handleClearTable = () => {
    clearCards();
    initializeDeck(1);

    setTimeout(() => {
      initializeHands();
    }, 250 / speedMultiplier);
  };

  const handleBetChange = (value: number) => {
    const clampedValue = Math.max(0, Math.min(value, balance));
    setBetValue(clampedValue);
  };

  const handleTemperatureChange = (value: number) => {
    setTemperature(value);
  };

  const handleSpeedMultiplierChange = (value: number) => {
    setSpeedMultiplier(value);
  };

  const handleStartAutoplay = () => {
    if (balance === 0) {
      return;
    }

    const needsReset =
      gameState === "game-over" ||
      gameState === "dealer-turn" ||
      playerCards.length === 0 ||
      playerCards[0].length === 0;

    if (needsReset) {
      handleClearTable();
    }

    setIsAutoplayActive(true);
  };

  const handleStopAutoplay = () => {
    setIsAutoplayActive(false);
  };

  return (
    <div className="min-h-screen bg-white text-black font-mono p-2 md:p-4">
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-2 border-black mb-4">
          <div className="col-span-1 md:col-span-12 border-b-2 border-black p-4 bg-white">
            <h1 className="text-xl font-black uppercase tracking-tighter flex justify-between items-center">
              <span>Blackjack Model Tester</span>
              <a
                href="https://x.com/devindevdevin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-normal normal-case hover:underline"
              >
                @devindevdevin
              </a>
            </h1>
          </div>
          <div className="md:col-span-4 flex flex-col border-b-2 md:border-b-0 md:border-r-2 border-black">
            <div className="p-4 border-b-2 border-black bg-black text-white">
              <span className="text-xs font-bold uppercase tracking-wider">
                Game Control
              </span>
            </div>
            <div className="p-4 flex gap-2 flex-wrap bg-white">
              <button
                onClick={reset}
                className="px-5 py-2.5 bg-white text-black border-2 border-black hover:bg-black hover:text-white focus:outline-none font-bold uppercase tracking-wider text-sm"
              >
                Reset Table
              </button>
              {!isAutoplayActive ? (
                <button
                  onClick={handleStartAutoplay}
                  className="px-5 py-2.5 bg-white text-black border-2 border-black hover:bg-black hover:text-white focus:outline-none font-bold uppercase tracking-wider text-sm"
                >
                  Start Model
                </button>
              ) : (
                <button
                  onClick={handleStopAutoplay}
                  className="px-5 py-2.5 bg-white text-black border-2 border-black hover:bg-black hover:text-white focus:outline-none font-bold uppercase tracking-wider text-sm"
                >
                  Stop Model
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col border-b-2 md:border-b-0 md:border-r-2 border-black">
            <div className="p-4 border-b-2 border-black bg-black text-white">
              <span className="text-xs font-bold uppercase tracking-wider">
                Status
              </span>
            </div>
            <div className="p-4 flex flex-col justify-center h-full bg-white space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase">Balance</span>
                <span className="text-xl font-bold font-mono">${balance}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase">Iterations</span>
                <span className="text-lg font-bold font-mono">
                  {totalIterations}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase">Player Wins</span>
                <span className="text-lg font-bold font-mono">
                  {playerWins}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase">Dealer Wins</span>
                <span className="text-lg font-bold font-mono">
                  {dealerWins}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase">Ties</span>
                <span className="text-lg font-bold font-mono">{ties}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col">
            <div className="p-4 border-b-2 border-black bg-black text-white">
              <span className="text-xs font-bold uppercase tracking-wider">
                Settings
              </span>
            </div>
            <div className="p-4 space-y-6 bg-white">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <label>Bet Amount</label>
                  <span>${betValue}</span>
                </div>
                <Slider
                  value={[betValue]}
                  onValueChange={(values) => handleBetChange(values[0])}
                  min={0}
                  max={Math.max(0, balance)}
                  step={1}
                  className="py-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <label>Temperature</label>
                  <span>{temperature.toFixed(1)}</span>
                </div>
                <Slider
                  value={[temperature]}
                  onValueChange={(values) => handleTemperatureChange(values[0])}
                  min={0}
                  max={1}
                  step={0.1}
                  className="py-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <label>Speed Multiplier</label>
                  <span>{speedMultiplier.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[speedMultiplier]}
                  onValueChange={(values) =>
                    handleSpeedMultiplierChange(values[0])
                  }
                  min={0.1}
                  max={20}
                  step={0.1}
                  className="py-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 order-2 lg:order-1 mb-8 lg:mb-0">
            <BlackjackTable
              dealerCards={dealerCards}
              playerCards={playerCards}
              currentHandIndex={currentHandIndex}
              stoodOnHands={stoodOnHands}
              handOutcomes={handOutcomes}
              speedMultiplier={speedMultiplier}
            />
          </div>
          <div className="lg:col-span-1 order-1 lg:order-2">
            <BalanceHistoryChart />
          </div>
        </div>
      </main>
    </div>
  );
}
