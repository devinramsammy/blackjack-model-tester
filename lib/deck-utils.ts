import { CARD_VALUES, CARD_SUITES } from "./constants";
import { BlackjackCardType, CutCardType } from "@/components/blackjack-card";

export type DeckCard = BlackjackCardType | CutCardType;

export function createDeck(deckCount: number): DeckCard[] {
  const cards: DeckCard[] = [];

  for (let deckIndex = 0; deckIndex < deckCount; deckIndex++) {
    for (const suite of CARD_SUITES) {
      for (const value of CARD_VALUES) {
        cards.push({
          value,
          suite,
          faceDown: false,
        });
      }
    }
  }

  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  const deckLength = cards.length;
  const back25PercentStart = Math.floor(deckLength * 0.75);
  const back25PercentEnd = deckLength - 1;

  const cutCardPosition = Math.floor(
    Math.random() * (back25PercentEnd - back25PercentStart + 1) +
      back25PercentStart
  );

  cards.splice(cutCardPosition, 0, { type: "cut" });

  return cards;
}

export function canSplitHand(hand: BlackjackCardType[]): boolean {
  return hand.length === 2 && hand[0].value === hand[1].value;
}
