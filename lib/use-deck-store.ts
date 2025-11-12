import { create } from "zustand";
import {
  createDeck,
  DeckCard,
  canSplitHand,
  shouldDealerStop,
  calculateHandValue,
  checkDealerCondition,
  checkPlayerCondition,
  areAllHandsCompleted,
  revealDealerCards,
  getHandCompletionState,
} from "./deck-utils";
import { BlackjackCardType } from "@/components/blackjack-card";

export type GameState = "player-turn" | "dealer-turn" | "game-over";

export type HandOutcome =
  | "player-wins"
  | "dealer-wins"
  | "player-busts"
  | "dealer-busts"
  | "tie"
  | null;

interface DeckStore {
  deck: DeckCard[];
  playerCards: BlackjackCardType[][];
  dealerCards: BlackjackCardType[];
  gameState: GameState;
  currentHandIndex: number;
  stoodOnHands: Set<number>;
  handOutcomes: Map<number, HandOutcome>;
  initializeDeck: (deckCount?: number) => void;
  getCard: () => BlackjackCardType | null;
  addCardToPlayer: (handIndex: number) => void;
  clearCards: () => void;
  initializeHands: () => void;
  splitHand: (handIndex: number) => void;
  stand: (handIndex: number) => void;
  setCurrentHandIndex: (index: number) => void;
  resetGameState: () => void;
}

export const useDeckStore = create<DeckStore>((set, get) => {
  const startDealerTurn = () => {
    const { dealerCards } = get();
    const currentDealerCards = revealDealerCards(dealerCards);
    set({ dealerCards: currentDealerCards, gameState: "dealer-turn" });

    const dealDealer = () => {
      const { dealerCards: currentCards, gameState: currentGameState } = get();

      if (currentGameState !== "dealer-turn") {
        return;
      }

      if (shouldDealerStop(currentCards)) {
        const dealerCondition = checkDealerCondition(currentCards);
        if (dealerCondition === "dealer-busts") {
          set((state) => {
            const newOutcomes = new Map(state.handOutcomes);
            for (let i = 0; i < state.playerCards.length; i++) {
              if (
                !newOutcomes.has(i) ||
                newOutcomes.get(i) !== "player-busts"
              ) {
                newOutcomes.set(i, "dealer-busts");
              }
            }
            return { handOutcomes: newOutcomes, gameState: "game-over" };
          });
          return;
        }

        const { playerCards: allPlayerCards } = get();
        const dealerValue = calculateHandValue(currentCards);

        set((state) => {
          const newOutcomes = new Map(state.handOutcomes);
          for (let i = 0; i < allPlayerCards.length; i++) {
            if (newOutcomes.has(i)) continue;

            const playerHand = allPlayerCards[i];
            const playerValue = calculateHandValue(playerHand);

            let outcome: HandOutcome;
            if (playerValue > 21) {
              outcome = "player-busts";
            } else if (playerValue > dealerValue) {
              outcome = "player-wins";
            } else if (dealerValue > playerValue) {
              outcome = "dealer-wins";
            } else {
              outcome = "tie";
            }
            newOutcomes.set(i, outcome);
          }
          return { handOutcomes: newOutcomes, gameState: "game-over" };
        });
        return;
      }

      const { getCard } = get();
      const card = getCard();
      if (!card) return;

      set((state) => ({
        dealerCards: [...state.dealerCards, { ...card, faceDown: false }],
      }));

      setTimeout(() => {
        const { dealerCards: updatedCards } = get();
        const dealerCondition = checkDealerCondition(updatedCards);
        if (dealerCondition === "dealer-busts") {
          set((state) => {
            const newOutcomes = new Map(state.handOutcomes);
            for (let i = 0; i < state.playerCards.length; i++) {
              if (
                !newOutcomes.has(i) ||
                newOutcomes.get(i) !== "player-busts"
              ) {
                newOutcomes.set(i, "dealer-busts");
              }
            }
            return { handOutcomes: newOutcomes, gameState: "game-over" };
          });
          return;
        }
        dealDealer();
      }, 300);
    };

    setTimeout(() => {
      dealDealer();
    }, 300);
  };

  return {
    deck: [],
    playerCards: [[]],
    dealerCards: [],
    gameState: "player-turn",
    currentHandIndex: 0,
    stoodOnHands: new Set<number>(),
    handOutcomes: new Map<number, HandOutcome>(),

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
      const playerCondition = checkPlayerCondition(playerHand);

      if (playerCondition === "player-busts") {
        let shouldStartDealerTurn = false;

        set((state) => {
          const completionState = getHandCompletionState(
            handIndex,
            "player-busts",
            state.handOutcomes,
            state.stoodOnHands,
            state.currentHandIndex,
            state.playerCards.length,
            state.dealerCards
          );

          const allHandsCompleted = areAllHandsCompleted(
            completionState.handOutcomes,
            completionState.stoodOnHands,
            state.playerCards.length
          );

          if (allHandsCompleted) {
            shouldStartDealerTurn = true;
            return {
              ...completionState,
              gameState: "dealer-turn" as GameState,
            };
          }

          return completionState;
        });

        if (shouldStartDealerTurn) {
          startDealerTurn();
        }
      } else if (playerCondition === "player-wins") {
        set((state) =>
          getHandCompletionState(
            handIndex,
            "player-wins",
            state.handOutcomes,
            state.stoodOnHands,
            state.currentHandIndex,
            state.playerCards.length,
            state.dealerCards
          )
        );
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
        currentHandIndex: 0,
        stoodOnHands: new Set<number>(),
        handOutcomes: new Map<number, HandOutcome>(),
      });
    },

    initializeHands: () => {
      const { getCard } = get();

      const playerCard1 = getCard();
      const playerCard2 = getCard();
      const dealerCard1 = getCard();
      const dealerCard2 = getCard();

      if (playerCard1 && playerCard2 && dealerCard1 && dealerCard2) {
        const playerCards = [
          { ...playerCard1, faceDown: false },
          { ...playerCard2, faceDown: false },
        ];
        const dealerCards = [
          { ...dealerCard1, faceDown: true },
          { ...dealerCard2, faceDown: false },
        ];

        set({
          playerCards: [playerCards],
          dealerCards,
          gameState: "player-turn",
        });

        const dealerCondition = checkDealerCondition(dealerCards);
        if (dealerCondition === "dealer-busts") {
          set((state) => {
            const newOutcomes = new Map<number, HandOutcome>();
            newOutcomes.set(0, "dealer-busts");
            return {
              gameState: "game-over",
              dealerCards: revealDealerCards(state.dealerCards),
              handOutcomes: newOutcomes,
            };
          });
          return;
        }
        const playerCondition = checkPlayerCondition(playerCards);
        if (playerCondition === "player-wins") {
          set((state) => {
            const newOutcomes = new Map<number, HandOutcome>();
            newOutcomes.set(0, "player-wins");
            return {
              gameState: "game-over",
              dealerCards: revealDealerCards(state.dealerCards),
              handOutcomes: newOutcomes,
            };
          });
          return;
        }
        if (playerCondition === "player-busts") {
          set((state) => {
            const newOutcomes = new Map<number, HandOutcome>();
            newOutcomes.set(0, "player-busts");
            return {
              gameState: "game-over",
              dealerCards: revealDealerCards(state.dealerCards),
              handOutcomes: newOutcomes,
            };
          });
          return;
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

      const originalHand: BlackjackCardType[] = [
        { ...hand[0], faceDown: false },
      ];

      set((state) => {
        const newPlayerCards = [...state.playerCards];
        newPlayerCards[handIndex] = originalHand;
        newPlayerCards.splice(handIndex + 1, 0, newHand);
        return { playerCards: newPlayerCards };
      });
    },

    setCurrentHandIndex: (index: number) => {
      set({ currentHandIndex: index });
    },

    stand: (handIndex: number) => {
      const { gameState, playerCards, stoodOnHands, handOutcomes } = get();
      if (gameState !== "player-turn") return;

      const newStoodOnHands = new Set(stoodOnHands);
      newStoodOnHands.add(handIndex);

      set({ stoodOnHands: newStoodOnHands });

      const allHandsCompleted = areAllHandsCompleted(
        handOutcomes,
        newStoodOnHands,
        playerCards.length
      );

      if (allHandsCompleted) {
        set({ gameState: "dealer-turn" });
        startDealerTurn();
      } else {
        const nextHandIndex = handIndex + 1;
        set({ currentHandIndex: nextHandIndex });
      }
    },
  };
});
