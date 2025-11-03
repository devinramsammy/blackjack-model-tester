"use client";

import { useState } from "react";
import { BlackjackTable } from "@/components/blackjack-table";
import { CARD_VALUES, CARD_SUITES } from "@/lib/constants";

export default function Home() {
  const [dealerCards, setDealerCards] = useState<
    Array<{ value: string; suite: string }>
  >([]);
  const [playerCards, setPlayerCards] = useState<
    Array<{ value: string; suite: string }>
  >([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  const getRandomCard = () => ({
    value: CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)],
    suite: CARD_SUITES[Math.floor(Math.random() * CARD_SUITES.length)],
  });

  const handleAddCard = () => {
    const newCard = getRandomCard();
    if (isPlayerTurn) {
      setPlayerCards((prev) => [...prev, newCard]);
    } else {
      setDealerCards((prev) => [...prev, newCard]);
    }
    setIsPlayerTurn(!isPlayerTurn);
  };

  const handleClearTable = () => {
    setDealerCards([]);
    setPlayerCards([]);
    setIsPlayerTurn(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto py-8 px-4">
        <div className="mb-4 flex gap-2">
          <button
            onClick={handleAddCard}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Add Card ({isPlayerTurn ? "Player" : "Dealer"})
          </button>
          <button
            onClick={handleClearTable}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
          >
            Clear Table
          </button>
        </div>
        <BlackjackTable dealerCards={dealerCards} playerCards={playerCards} />
      </main>
    </div>
  );
}
