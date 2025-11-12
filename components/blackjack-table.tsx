"use client";

import { BlackjackCard, BlackjackCardType } from "./blackjack-card";
import { motion, AnimatePresence } from "motion/react";
import { useDeckStore, GameState, HandOutcome } from "@/lib/use-deck-store";
import { canSplitHand, calculateHandValue } from "@/lib/deck-utils";

interface BlackjackTableProps {
  dealerCards?: BlackjackCardType[];
  playerCards?: BlackjackCardType[][];
  gameState?: GameState;
  currentHandIndex?: number;
  stoodOnHands?: Set<number>;
  handOutcomes?: Map<number, HandOutcome>;
}

const getOutcomeMessage = (outcome: HandOutcome): string => {
  switch (outcome) {
    case "player-wins":
      return "Player Wins";
    case "dealer-wins":
      return "Dealer Wins";
    case "player-busts":
      return "Player Busts";
    case "dealer-busts":
      return "Player Wins";
    case "tie":
      return "Tie";
    default:
      return "";
  }
};

const getOutcomeColorClasses = (outcome: HandOutcome): string => {
  switch (outcome) {
    case "player-wins":
    case "dealer-busts":
      return "text-green-600";
    case "dealer-wins":
    case "player-busts":
      return "text-red-600";
    case "tie":
      return "text-yellow-600";
    default:
      return "";
  }
};

export function BlackjackTable({
  dealerCards = [],
  playerCards = [[]],
  gameState = "player-turn",
  currentHandIndex = 0,
  stoodOnHands = new Set<number>(),
  handOutcomes = new Map<number, HandOutcome>(),
}: BlackjackTableProps) {
  const { splitHand, addCardToPlayer, stand } = useDeckStore();

  const dealerHandValue = calculateHandValue(dealerCards);
  const hasFaceDownCards = dealerCards.some((card) => card.faceDown);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-start gap-6">
        <div className="text-sm font-medium w-20 flex-shrink-0 pt-1">
          <div>Dealer</div>
          {dealerCards.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {hasFaceDownCards ? "?" : dealerHandValue}
            </div>
          )}
        </div>
        <div className="flex-1 min-h-[7rem]">
          <div className="flex gap-2 flex-wrap">
            <AnimatePresence mode="popLayout">
              {dealerCards.map((card, i) => (
                <motion.div
                  key={`${card.value}-${card.suite}-${i}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.5,
                    x: -100,
                  }}
                  transition={{
                    duration: 0.15,
                    delay: (dealerCards.length - i - 1) * 0.05,
                  }}
                  layout
                >
                  <BlackjackCard
                    value={card.value}
                    suite={card.suite}
                    faceDown={card.faceDown}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {playerCards.map((hand, handIndex) => {
          const canSplit = canSplitHand(hand);
          const handValue = calculateHandValue(hand);
          const isCurrentHand = currentHandIndex === handIndex;
          const hasStood = stoodOnHands.has(handIndex);
          const isGameOver = gameState !== "player-turn";
          const outcome = handOutcomes.get(handIndex);

          return (
            <div key={handIndex} className="flex items-start gap-6">
              <div className="text-sm font-medium w-20 flex-shrink-0 pt-1">
                <div>
                  {playerCards.length > 1 ? `Hand ${handIndex + 1}` : "Hand"}
                </div>
                {hand.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {handValue}
                  </div>
                )}
                {hasStood && !outcome && (
                  <div className="text-xs text-yellow-600 mt-1">Stood</div>
                )}
                {outcome && (
                  <div
                    className={`text-xs font-semibold mt-2 ${getOutcomeColorClasses(
                      outcome
                    )}`}
                  >
                    {getOutcomeMessage(outcome)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-[7rem] flex items-center gap-4">
                <div className="flex gap-2 flex-wrap">
                  <AnimatePresence mode="popLayout">
                    {hand.map((card, i) => (
                      <motion.div
                        key={`${card.value}-${card.suite}-${handIndex}-${i}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{
                          opacity: 0,
                          scale: 0.5,
                          x: -100,
                        }}
                        transition={{
                          duration: 0.15,
                          delay: (hand.length - i - 1) * 0.05,
                        }}
                        layout
                      >
                        <BlackjackCard
                          value={card.value}
                          suite={card.suite}
                          faceDown={card.faceDown}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="ml-auto flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => addCardToPlayer(handIndex)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      !isCurrentHand || isGameOver || hasStood || !!outcome
                    }
                  >
                    Hit
                  </button>
                  <button
                    onClick={() => stand(handIndex)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      !isCurrentHand || isGameOver || hasStood || !!outcome
                    }
                  >
                    Stand
                  </button>
                  <button
                    onClick={() => splitHand(handIndex)}
                    className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      !canSplit || !isCurrentHand || isGameOver || !!outcome
                    }
                  >
                    Split
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
