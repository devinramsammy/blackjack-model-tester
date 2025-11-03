import { create } from "zustand";
import { createDeck, DeckCard } from "./deck-utils";
import { BlackjackCardType } from "@/components/blackjack-card";

interface DeckStore {
  deck: DeckCard[];
  playerCards: BlackjackCardType[];
  dealerCards: BlackjackCardType[];
  initializeDeck: (deckCount?: number) => void;
  getCard: () => BlackjackCardType | null;
  addCardToPlayer: () => void;
  addCardToDealer: () => void;
  clearCards: () => void;
  initializeHands: () => void;
  flipDealerCard: (index: number) => void;
}

export const useDeckStore = create<DeckStore>((set, get) => ({
  deck: [],
  playerCards: [],
  dealerCards: [],

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

  addCardToPlayer: () => {
    const { getCard } = get();
    const card = getCard();
    if (!card) return;
    set((state) => ({
      playerCards: [...state.playerCards, { ...card, faceDown: false }],
    }));
  },

  addCardToDealer: () => {
    const { getCard } = get();
    const card = getCard();
    if (!card) return;
    set((state) => ({
      dealerCards: [...state.dealerCards, { ...card, faceDown: false }],
    }));
  },

  clearCards: () => {
    set({
      playerCards: [],
      dealerCards: [],
    });
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

  flipDealerCard: (index: number) => {
    set((state) => ({
      dealerCards: state.dealerCards.map((card, i) =>
        i === index ? { ...card, faceDown: !card.faceDown } : card
      ),
    }));
  },
}));
