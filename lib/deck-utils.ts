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

export function calculateHandValue(hand: BlackjackCardType[]): number {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.value === "A") {
      aces += 1;
      value += 11;
    } else if (card.value === "K" || card.value === "Q" || card.value === "J") {
      value += 10;
    } else {
      value += parseInt(card.value, 10);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }

  return value;
}

export function isNatural21(hand: BlackjackCardType[]): boolean {
  return calculateHandValue(hand) === 21;
}

export function isBust(hand: BlackjackCardType[]): boolean {
  return calculateHandValue(hand) > 21;
}

export function isSoft17(hand: BlackjackCardType[]): boolean {
  let minTotal = 0;
  let aces = 0;

  for (const { value } of hand) {
    if (value === "A") {
      aces += 1;
      minTotal += 1;
    } else if (
      value === "K" ||
      value === "Q" ||
      value === "J" ||
      value === "10"
    ) {
      minTotal += 10;
    } else {
      minTotal += Number(value);
    }
  }

  return aces > 0 && minTotal === 7;
}

export function shouldDealerStop(hand: BlackjackCardType[]): boolean {
  const handValue = calculateHandValue(hand);
  const soft17 = isSoft17(hand);
  return soft17 || handValue >= 17;
}

export function checkDealerCondition(
  dealerCards: BlackjackCardType[]
): "dealer-wins" | "dealer-busts" | null {
  const dealerValue = calculateHandValue(dealerCards);
  if (dealerValue === 21) {
    return "dealer-wins";
  }
  if (isBust(dealerCards)) {
    return "dealer-busts";
  }
  return null;
}

export function checkPlayerCondition(
  playerCards: BlackjackCardType[]
): "player-wins" | "player-busts" | null {
  const playerValue = calculateHandValue(playerCards);
  if (playerValue === 21) {
    return "player-wins";
  }
  if (isBust(playerCards)) {
    return "player-busts";
  }
  return null;
}
