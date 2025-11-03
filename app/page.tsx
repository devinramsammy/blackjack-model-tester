"use client";

import { useEffect } from "react";
import { BlackjackTable } from "@/components/blackjack-table";
import { useDeckStore } from "@/lib/use-deck-store";

export default function Home() {
  const {
    playerCards,
    dealerCards,
    isPlayerTurn,
    getCard,
    initializeDeck,
    addCardToPlayer,
    addCardToDealer,
    clearCards,
    setIsPlayerTurn,
    initializeHands,
  } = useDeckStore();

  useEffect(() => {
    initializeDeck(1);
  }, [initializeDeck]);

  const handleAddCard = () => {
    const card = getCard();
    if (!card) return;

    const cardWithFaceDown = { ...card, faceDown: !isPlayerTurn };

    if (isPlayerTurn) {
      addCardToPlayer(cardWithFaceDown);
    } else {
      addCardToDealer(cardWithFaceDown);
    }
    setIsPlayerTurn(!isPlayerTurn);
  };

  const handleClearTable = () => {
    clearCards();
    initializeDeck(1);

    setTimeout(() => {
      initializeHands();
    }, 250);
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
