"use client";

import { useEffect } from "react";
import { BlackjackTable } from "@/components/blackjack-table";
import { useDeckStore } from "@/lib/use-deck-store";

export default function Home() {
  const {
    playerCards,
    dealerCards,
    initializeDeck,
    addCardToPlayer,
    addCardToDealer,
    clearCards,
    initializeHands,
    flipDealerCard,
  } = useDeckStore();

  useEffect(() => {
    initializeDeck(1);
  }, [initializeDeck]);

  const handleAddCardToPlayer = () => {
    addCardToPlayer();
  };

  const handleAddCardToDealer = () => {
    addCardToDealer();
  };

  const handleFlipDealerCard = () => {
    if (dealerCards.length > 0) {
      // Flip the first face-down card, or the first card if all are face-up
      const firstFaceDownIndex = dealerCards.findIndex((card) => card.faceDown);
      const indexToFlip = firstFaceDownIndex !== -1 ? firstFaceDownIndex : 0;
      flipDealerCard(indexToFlip);
    }
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
        <div className="mb-4 flex gap-2 flex-wrap">
          <button
            onClick={handleAddCardToPlayer}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Add Card to Player
          </button>
          <button
            onClick={handleAddCardToDealer}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Add Card to Dealer
          </button>
          <button
            onClick={handleFlipDealerCard}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
            disabled={dealerCards.length === 0}
          >
            Flip Dealer Card
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
