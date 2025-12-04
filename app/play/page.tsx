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
import { Header } from "@/components/header";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function PlayPage() {
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

  const [modelSuggestion, setModelSuggestion] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isStatusCollapsed, setIsStatusCollapsed] = useState(false);
  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(false);

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
    const runPrediction = async () => {
      if (gameState !== "player-turn") {
        setModelSuggestion(null);
        return;
      }

      const currentHand = playerCards[currentHandIndex];
      if (!currentHand || currentHand.length === 0) {
        return;
      }

      const dealerUpcard = dealerCards.find((card) => !card.faceDown);
      if (!dealerUpcard) return;

      setIsEvaluating(true);
      try {
        const allowedActions = getAvailablePlayerMoves(currentHand);
        const action = await predictAction(
          currentHand,
          dealerUpcard,
          allowedActions,
          0.0
        );
        setModelSuggestion(action);
      } catch (e) {
        console.error(e);
      } finally {
        setIsEvaluating(false);
      }
    };

    runPrediction();
  }, [gameState, playerCards, dealerCards, currentHandIndex]);

  useEffect(() => {
    if (gameState === "game-over") {
      if (handOutcomes.size > 0) {
        updateGameStatistics(handOutcomes);
      }
    }
  }, [gameState, handOutcomes, updateGameStatistics]);

  const handleReset = () => {
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
    }, 100);
  };

  const hasCardsDealt = playerCards[0]?.length > 0;
  const isFirstMovePlayed =
    playerCards.length > 1 ||
    (playerCards[0] && playerCards[0].length > 2) ||
    stoodOnHands.size > 0;

  const canModifyBet =
    gameState === "game-over" ||
    !hasCardsDealt ||
    (!isFirstMovePlayed && gameState === "player-turn");

  const handleBetChange = (value: number) => {
    const clampedValue = Math.max(0, Math.min(value, balance));
    setBetValue(clampedValue);

    if (gameState === "player-turn" && hasCardsDealt && !isFirstMovePlayed) {
      setBet(0, clampedValue);
    }
  };

  const currentHand = playerCards[currentHandIndex] || [];
  const allowedActions =
    gameState === "player-turn" ? getAvailablePlayerMoves(currentHand) : [];

  const handleHit = () => addCardToPlayer(currentHandIndex);
  const handleStand = () => stand(currentHandIndex);
  const handleDouble = () => {
    const currentBet = getBet(currentHandIndex);
    if (balance < currentBet) return;
    setBet(currentHandIndex, currentBet * 2);
    addCardToPlayer(currentHandIndex);

    stand(currentHandIndex);
  };

  const handleSplit = () => splitHand(currentHandIndex);

  return (
    <div className="min-h-screen bg-white text-black font-mono p-2 md:p-4">
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-2 border-black mb-4">
          <Header />

          {/* Controls */}
          <div className="md:col-span-4 flex flex-col border-b-2 md:border-b-0 md:border-r-2 border-black">
            <div className="p-4 border-b-2 border-black bg-black text-white flex items-center min-h-[3.5rem]">
              <span className="text-xs font-bold uppercase tracking-wider">
                Game Control
              </span>
            </div>
            <div className="p-4 flex flex-col gap-4 bg-white min-h-[100px]">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full">
                <button
                  onClick={handleHit}
                  disabled={!allowedActions.includes("HIT")}
                  className="w-full px-2 py-2 bg-white text-black border-2 border-black hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black font-bold uppercase tracking-wider text-xs"
                >
                  Hit
                </button>
                <button
                  onClick={handleStand}
                  disabled={!allowedActions.includes("STAND")}
                  className="w-full px-2 py-2 bg-white text-black border-2 border-black hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black font-bold uppercase tracking-wider text-xs"
                >
                  Stand
                </button>
                <button
                  onClick={handleDouble}
                  disabled={!allowedActions.includes("DOUBLE")}
                  className="w-full px-2 py-2 bg-white text-black border-2 border-black hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black font-bold uppercase tracking-wider text-xs"
                >
                  Double
                </button>
                <button
                  onClick={handleSplit}
                  disabled={!allowedActions.includes("SPLIT")}
                  className="w-full px-2 py-2 bg-white text-black border-2 border-black hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black font-bold uppercase tracking-wider text-xs"
                >
                  Split
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleClearTable}
                  disabled={
                    gameState === "player-turn" &&
                    !handOutcomes.get(currentHandIndex)
                  }
                  className="w-full px-4 py-2 bg-white text-black border-2 border-black hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black font-bold uppercase tracking-wider text-sm"
                >
                  Clear Table
                </button>
                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black font-bold uppercase tracking-wider text-sm"
                >
                  Reset Game
                </button>
              </div>
            </div>
            <div className="border-t-2 border-black p-4 bg-gray-50">
              <div className="text-xs font-bold uppercase mb-1">
                Model Prediction:
              </div>
              <div className="font-mono font-bold text-lg">
                {modelSuggestion ? modelSuggestion : isEvaluating ? "..." : "-"}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="md:col-span-4 flex flex-col border-b-2 md:border-b-0 md:border-r-2 border-black">
            <button
              onClick={() => setIsStatusCollapsed(!isStatusCollapsed)}
              className="md:pointer-events-none p-4 border-b-2 border-black bg-black text-white flex items-center justify-between md:justify-start min-h-[3.5rem]"
            >
              <span className="text-xs font-bold uppercase tracking-wider">
                Status
              </span>
              <span className="md:hidden">
                {isStatusCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </span>
            </button>
            <div
              className={`p-4 flex flex-col justify-center h-full bg-white space-y-3 ${
                isStatusCollapsed ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase">Balance</span>
                <span className="text-lg font-bold font-mono">${balance}</span>
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

          {/* Settings */}
          <div className="md:col-span-4 flex flex-col">
            <button
              onClick={() => setIsSettingsCollapsed(!isSettingsCollapsed)}
              className="md:pointer-events-none p-4 border-b-2 border-black bg-black text-white flex items-center justify-between md:justify-start min-h-[3.5rem]"
            >
              <span className="text-xs font-bold uppercase tracking-wider">
                Settings
              </span>
              <span className="md:hidden">
                {isSettingsCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </span>
            </button>
            <div
              className={`p-4 space-y-6 bg-white h-full flex flex-col justify-center ${
                isSettingsCollapsed ? "hidden md:flex" : "flex"
              }`}
            >
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
                  disabled={!canModifyBet}
                  className="py-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <BlackjackTable
              dealerCards={dealerCards}
              playerCards={playerCards}
              currentHandIndex={currentHandIndex}
              stoodOnHands={stoodOnHands}
              handOutcomes={handOutcomes}
              speedMultiplier={1}
            />
          </div>
          <div className="lg:col-span-1">
            <BalanceHistoryChart />
          </div>
        </div>
      </main>
    </div>
  );
}
