import { describe, it, expect } from "vitest";
import { canSplitHand, createDeck } from "./deck-utils";
import { BlackjackCardType } from "@/components/blackjack-card";
import { CARD_VALUES, CARD_SUITES } from "./constants";

describe("canSplitHand", () => {
  it("should return true when hand has exactly 2 cards with the same value", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
      { value: "A", suite: "spades", faceDown: false },
    ];
    expect(canSplitHand(hand)).toBe(true);
  });

  it("should return false when hand has 2 cards with different values", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
      { value: "K", suite: "spades", faceDown: false },
    ];
    expect(canSplitHand(hand)).toBe(false);
  });

  it("should return false when hand has less than 2 cards", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
    ];
    expect(canSplitHand(hand)).toBe(false);
  });

  it("should return false when hand has more than 2 cards", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
      { value: "A", suite: "spades", faceDown: false },
      { value: "A", suite: "diamonds", faceDown: false },
    ];
    expect(canSplitHand(hand)).toBe(false);
  });

  it("should return false when hand is empty", () => {
    const hand: BlackjackCardType[] = [];
    expect(canSplitHand(hand)).toBe(false);
  });

  it("should return true for matching face cards (same value)", () => {
    const hand: BlackjackCardType[] = [
      { value: "J", suite: "hearts", faceDown: false },
      { value: "J", suite: "clubs", faceDown: false },
    ];
    expect(canSplitHand(hand)).toBe(true);
  });

  it("should return true for matching number cards", () => {
    const hand: BlackjackCardType[] = [
      { value: "10", suite: "hearts", faceDown: false },
      { value: "10", suite: "diamonds", faceDown: false },
    ];
    expect(canSplitHand(hand)).toBe(true);
  });

  it("should return false when cards have same suite but different values", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
      { value: "K", suite: "hearts", faceDown: false },
    ];
    expect(canSplitHand(hand)).toBe(false);
  });
});

describe("createDeck", () => {
  it("should create a deck with the correct number of cards and a cut card", () => {
    const deck = createDeck(1);
    expect(deck.length).toBe(53);
    expect(
      deck.find((card) => "type" in card && card.type === "cut")
    ).toBeDefined();
    const cutCards = deck.filter(
      (card) => "type" in card && card.type === "cut"
    );
    expect(cutCards.length).toBe(1);
  });

  it("should contain all expected card values and suites for single deck", () => {
    const deck = createDeck(1);
    const regularCards = deck.filter(
      (card) => !("type" in card && card.type === "cut")
    ) as BlackjackCardType[];

    expect(regularCards.length).toBe(52);

    const cardCounts = new Map<string, number>();
    regularCards.forEach((card) => {
      const key = `${card.value}-${card.suite}`;
      cardCounts.set(key, (cardCounts.get(key) || 0) + 1);
    });

    expect(cardCounts.size).toBe(52);
    for (const count of cardCounts.values()) {
      expect(count).toBe(1);
    }
  });

  it("should place cut card in the back 25% of the deck", () => {
    for (let i = 0; i < 10; i++) {
      const deck = createDeck(1);
      const cutCardIndex = deck.findIndex(
        (card) => "type" in card && card.type === "cut"
      );

      const deckLength = 52;
      const back25PercentStart = Math.floor(deckLength * 0.75);
      const back25PercentEnd = deckLength;

      expect(cutCardIndex).toBeGreaterThanOrEqual(back25PercentStart);
      expect(cutCardIndex).toBeLessThanOrEqual(back25PercentEnd);
    }
  });
});
