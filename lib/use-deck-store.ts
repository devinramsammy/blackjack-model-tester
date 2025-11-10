import { create } from "zustand";
import {
  createDeck,
  DeckCard,
  canSplitHand,
  shouldDealerStop,
  isBust,
  calculateHandValue,
  checkDealerCondition,
} from "./deck-utils";
import { BlackjackCardType } from "@/components/blackjack-card";

export type GameState =
  | "player-turn"
  | "dealer-turn"
  | "player-wins"
  | "dealer-wins"
  | "player-busts"
  | "dealer-busts"
  | "tie";

interface DeckStore {
  deck: DeckCard[];
  playerCards: BlackjackCardType[][];
  dealerCards: BlackjackCardType[];
  gameState: GameState;
  initializeDeck: (deckCount?: number) => void;
  getCard: () => BlackjackCardType | null;
  addCardToPlayer: (handIndex: number) => void;
  clearCards: () => void;
  initializeHands: () => void;
  splitHand: (handIndex: number) => void;
  stand: () => void;
  resetGameState: () => void;
}

export const useDeckStore = create<DeckStore>((set, get) => ({
  deck: [],
  playerCards: [[]],
  dealerCards: [],
  gameState: "player-turn",

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

  addCardToPlayer: (handIndex: number) => {
    const { getCard, gameState } = get();
    if (gameState !== "player-turn") return;

    const card = getCard();
    if (!card) return;
    set((state) => {
      const currentHands = [...state.playerCards];
      currentHands[handIndex] = [
        ...currentHands[handIndex],
        { ...card, faceDown: false },
      ];
      return { playerCards: currentHands };
    });

    const { playerCards: updatedPlayerCards } = get();
    const playerHand = updatedPlayerCards[handIndex];
    if (isBust(playerHand)) {
      set((state) => {
        const dealerCards = state.dealerCards.map((card, index) => ({
          ...card,
          faceDown: index === 0 ? false : card.faceDown,
        }));
        return {
          gameState: "player-busts",
          dealerCards,
        };
      });
      return;
    }
  },

  resetGameState: () => {
    set({ gameState: "player-turn" });
  },

  clearCards: () => {
    set({
      playerCards: [[]],
      dealerCards: [],
      gameState: "player-turn",
    });
  },

  initializeHands: () => {
    const { getCard } = get();

    const playerCard1 = getCard();
    const playerCard2 = getCard();
    const dealerCard1 = getCard();
    const dealerCard2 = getCard();

    if (playerCard1 && playerCard2 && dealerCard1 && dealerCard2) {
      const dealerCards = [
        { ...dealerCard1, faceDown: true },
        { ...dealerCard2, faceDown: false },
      ];

      set({
        playerCards: [
          [
            { ...playerCard1, faceDown: false },
            { ...playerCard2, faceDown: false },
          ],
        ],
        dealerCards,
        gameState: "player-turn",
      });

      const dealerCondition = checkDealerCondition(dealerCards);
      if (dealerCondition) {
        set((state) => {
          const dealerCards = state.dealerCards.map((card, index) => ({
            ...card,
            faceDown: index === 0 ? false : card.faceDown,
          }));
          return {
            gameState: dealerCondition,
            dealerCards,
          };
        });
      }
    }
  },

  splitHand: (handIndex: number) => {
    const { playerCards } = get();
    const hand = playerCards[handIndex];

    if (!hand || !canSplitHand(hand)) {
      return;
    }

    const secondCard = hand[1];
    const newHand: BlackjackCardType[] = [{ ...secondCard, faceDown: false }];

    const originalHand: BlackjackCardType[] = [{ ...hand[0], faceDown: false }];

    set((state) => {
      const newPlayerCards = [...state.playerCards];
      newPlayerCards[handIndex] = originalHand;
      newPlayerCards.splice(handIndex + 1, 0, newHand);
      return { playerCards: newPlayerCards };
    });
  },

  stand: () => {
    const { getCard, dealerCards, gameState } = get();
    if (gameState !== "player-turn") return;

    let currentDealerCards = dealerCards.map((card, index) => ({
      ...card,
      faceDown: index === 0 ? false : card.faceDown,
    }));

    set({ dealerCards: currentDealerCards, gameState: "dealer-turn" });

    const dealDealer = () => {
      const { dealerCards: currentCards, gameState: currentGameState } = get();

      if (currentGameState !== "dealer-turn") {
        return;
      }

      if (shouldDealerStop(currentCards)) {
        const dealerCondition = checkDealerCondition(currentCards);
        if (dealerCondition) {
          set({ gameState: dealerCondition });
          return;
        }

        const { playerCards } = get();
        const playerHand = playerCards[0];
        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(currentCards);

        let finalState: GameState;
        if (playerValue > dealerValue) {
          finalState = "player-wins";
        } else if (dealerValue > playerValue) {
          finalState = "dealer-wins";
        } else {
          finalState = "tie";
        }

        set({ gameState: finalState });
        return;
      }

      const card = getCard();
      if (!card) return;

      set((state) => ({
        dealerCards: [...state.dealerCards, { ...card, faceDown: false }],
      }));

      setTimeout(() => {
        const { dealerCards: updatedCards } = get();
        const dealerCondition = checkDealerCondition(updatedCards);
        if (dealerCondition) {
          set({ gameState: dealerCondition });
          return;
        }
        dealDealer();
      }, 300);
    };

    setTimeout(() => {
      dealDealer();
    }, 300);
  },
}));
