import { create } from "zustand";
import { createDeck, DeckCard } from "./deck-utils";
import { BlackjackCardType } from "@/components/blackjack-card";

interface DeckStore {
  deck: DeckCard[];
  playerCards: BlackjackCardType[];
  dealerCards: BlackjackCardType[];
  isPlayerTurn: boolean;
  initializeDeck: (deckCount?: number) => void;
  getCard: () => BlackjackCardType | null;
  addCardToPlayer: (card: BlackjackCardType) => void;
  addCardToDealer: (card: BlackjackCardType) => void;
  clearCards: () => void;
  setIsPlayerTurn: (isPlayerTurn: boolean) => void;
  initializeHands: () => void;
}

export const useDeckStore = create<DeckStore>((set, get) => ({
  deck: [],
  playerCards: [],
  dealerCards: [],
  isPlayerTurn: true,

  initializeDeck: (deckCount = 1) => {
    const newDeck = createDeck(deckCount);
    set({ deck: newDeck });
  },

  getCard: () => {
    const { deck } = get();
    if (deck.length === 0) {
      return null;
    }

    let currentDeck = [...deck];
    let card = currentDeck.shift();

    // skip cut cards
    while (card && "type" in card && card.type === "cut") {
      if (currentDeck.length === 0) {
        set({ deck: [] });
        return null;
      }
      card = currentDeck.shift();
    }

    if (!card || "type" in card) {
      set({ deck: currentDeck });
      return null;
    }

    set({ deck: currentDeck });
    return card;
  },

  addCardToPlayer: (card: BlackjackCardType) => {
    set((state) => ({
      playerCards: [...state.playerCards, card],
    }));
  },

  addCardToDealer: (card: BlackjackCardType) => {
    set((state) => ({
      dealerCards: [...state.dealerCards, card],
    }));
  },

  clearCards: () => {
    set({
      playerCards: [],
      dealerCards: [],
      isPlayerTurn: true,
    });
  },

  setIsPlayerTurn: (isPlayerTurn: boolean) => {
    set({ isPlayerTurn });
  },

  initializeHands: () => {
    const { getCard } = get();

    const playerCard1 = getCard();
    const playerCard2 = getCard();
    const dealerCard1 = getCard();
    const dealerCard2 = getCard();

    if (playerCard1 && playerCard2 && dealerCard1 && dealerCard2) {
      set({
        playerCards: [
          { ...playerCard1, faceDown: false },
          { ...playerCard2, faceDown: false },
        ],
        dealerCards: [
          { ...dealerCard1, faceDown: true },
          { ...dealerCard2, faceDown: false },
        ],
      });
    }
  },
}));
