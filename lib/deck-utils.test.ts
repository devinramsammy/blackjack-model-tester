import { describe, it, expect } from "vitest";
import {
  canSplitHand,
  createDeck,
  calculateHandValue,
  isSoft17,
  shouldDealerStop,
} from "./deck-utils";
import { BlackjackCardType } from "@/components/blackjack-card";

const createHand = (values: (string | number)[]): BlackjackCardType[] => {
  return values.map((val, index) => ({
    value: String(val),
    suite: index % 2 === 0 ? "hearts" : "spades",
    faceDown: false,
  }));
};

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

describe("calculateHandValue", () => {
  it("should handle single ace with low cards - ace as 11", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
      { value: "5", suite: "spades", faceDown: false },
    ];
    expect(calculateHandValue(hand)).toBe(16);
  });

  it("should handle single ace with high cards - ace as 1", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
      { value: "K", suite: "spades", faceDown: false },
    ];
    expect(calculateHandValue(hand)).toBe(21);
  });

  it("should handle two aces - one as 11, one as 1", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
      { value: "A", suite: "spades", faceDown: false },
    ];
    expect(calculateHandValue(hand)).toBe(12);
  });

  it("should handle two aces with low card - one as 11 and one as 1", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
      { value: "A", suite: "spades", faceDown: false },
      { value: "3", suite: "diamonds", faceDown: false },
    ];
    expect(calculateHandValue(hand)).toBe(15);
  });

  it("should handle two aces with mid card - one as 11 and one as 1", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
      { value: "A", suite: "spades", faceDown: false },
      { value: "9", suite: "diamonds", faceDown: false },
    ];
    expect(calculateHandValue(hand)).toBe(21);
  });

  it("should handle three aces - only one as 11", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
      { value: "A", suite: "spades", faceDown: false },
      { value: "A", suite: "diamonds", faceDown: false },
    ];
    expect(calculateHandValue(hand)).toBe(13);
  });

  it("should handle three aces with low card", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
      { value: "A", suite: "spades", faceDown: false },
      { value: "A", suite: "diamonds", faceDown: false },
      { value: "2", suite: "clubs", faceDown: false },
    ];
    expect(calculateHandValue(hand)).toBe(15);
  });

  it("should handle four aces - all as 1", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
      { value: "A", suite: "spades", faceDown: false },
      { value: "A", suite: "diamonds", faceDown: false },
      { value: "A", suite: "clubs", faceDown: false },
    ];
    expect(calculateHandValue(hand)).toBe(14);
  });

  it("should handle ace with multiple face cards - ace as 1", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
      { value: "K", suite: "spades", faceDown: false },
      { value: "Q", suite: "diamonds", faceDown: false },
    ];
    expect(calculateHandValue(hand)).toBe(21);
  });

  it("should handle ace in middle of hand - ace as 11", () => {
    const hand: BlackjackCardType[] = [
      { value: "3", suite: "hearts", faceDown: false },
      { value: "A", suite: "spades", faceDown: false },
      { value: "7", suite: "diamonds", faceDown: false },
    ];
    expect(calculateHandValue(hand)).toBe(21);
  });

  it("should handle ace at end of hand - ace as 1", () => {
    const hand: BlackjackCardType[] = [
      { value: "9", suite: "hearts", faceDown: false },
      { value: "10", suite: "spades", faceDown: false },
      { value: "A", suite: "diamonds", faceDown: false },
    ];
    expect(calculateHandValue(hand)).toBe(20);
  });

  it("should handle two aces with face card", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
      { value: "A", suite: "spades", faceDown: false },
      { value: "J", suite: "diamonds", faceDown: false },
    ];
    expect(calculateHandValue(hand)).toBe(12);
  });

  it("should return 0 for empty hand", () => {
    const hand: BlackjackCardType[] = [];
    expect(calculateHandValue(hand)).toBe(0);
  });

  it("should handle single card that is an ace", () => {
    const hand: BlackjackCardType[] = [
      { value: "A", suite: "hearts", faceDown: false },
    ];
    expect(calculateHandValue(hand)).toBe(11);
  });
});

describe("isSoft17", () => {
  it("should return true for ['A', 6] - Ace as 11", () => {
    const hand = createHand(["A", 6]);
    expect(isSoft17(hand)).toBe(true);
  });

  it("should return true for ['A', 3, 3] - Ace as 11", () => {
    const hand = createHand(["A", 3, 3]);
    expect(isSoft17(hand)).toBe(true);
  });

  it("should return true for ['A', 5, 'A'] - One Ace as 11", () => {
    const hand = createHand(["A", 5, "A"]);
    expect(isSoft17(hand)).toBe(true);
  });

  it("should return false for ['10', 7] - No Ace", () => {
    const hand = createHand(["10", 7]);
    expect(isSoft17(hand)).toBe(false);
  });

  it("should return false for ['A', 6, '10'] - Ace forced to 1", () => {
    const hand = createHand(["A", 6, "10"]);
    expect(isSoft17(hand)).toBe(false);
  });

  it("should return true for ['A', 4, 2] - Ace as 11", () => {
    const hand = createHand(["A", 4, 2]);
    expect(isSoft17(hand)).toBe(true);
  });

  it("should return false for ['A', 4, 2, 'A'] - Not 17", () => {
    const hand = createHand(["A", 4, 2, "A"]);
    expect(isSoft17(hand)).toBe(false);
  });

  it("should return true for ['A', '5', 'A'] - One Ace as 11", () => {
    const hand = createHand(["A", "5", "A"]);
    expect(isSoft17(hand)).toBe(true);
  });
});

describe("shouldDealerStop", () => {
  it("should return true for soft 17", () => {
    const hand = createHand(["A", 6]);
    expect(shouldDealerStop(hand)).toBe(true);
  });

  it("should return true for hard 17", () => {
    const hand = createHand(["10", 7]);
    expect(shouldDealerStop(hand)).toBe(true);
  });

  it("should return true for value greater than 17", () => {
    const hand = createHand(["10", 8]);
    expect(shouldDealerStop(hand)).toBe(true);
  });

  it("should return true for value 21", () => {
    const hand = createHand(["A", "K"]);
    expect(shouldDealerStop(hand)).toBe(true);
  });

  it("should return false for value less than 17", () => {
    const hand = createHand(["10", 4]);
    expect(shouldDealerStop(hand)).toBe(false);
  });

  it("should return true for busted hand (value > 21)", () => {
    const hand = createHand(["10", "10", 5]);
    expect(shouldDealerStop(hand)).toBe(true);
  });
});
