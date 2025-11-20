"use client";

import { BlackjackCard, BlackjackCardType } from "./blackjack-card";
import { motion, AnimatePresence } from "motion/react";
import { GameState, HandOutcome } from "@/lib/use-deck-store";
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
      return "bg-black text-white px-1";
    case "dealer-wins":
    case "player-busts":
      return "bg-black text-white px-1 line-through decoration-2";
    case "tie":
      return "border border-black text-black px-1";
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
  const dealerHandValue = calculateHandValue(dealerCards);
  const hasFaceDownCards = dealerCards.some((card) => card.faceDown);

  return (
    <div className="flex flex-col gap-0 border-2 border-black">
      <div className="flex flex-col md:flex-row items-start border-b-2 border-black">
        <div className="w-full md:w-32 p-4 border-b-2 md:border-b-0 md:border-r-2 border-black bg-black text-white">
          <div className="text-lg font-bold uppercase tracking-tighter">
            Dealer
          </div>
          {dealerCards.length > 0 && (
            <div className="text-sm font-mono mt-2">
              TOTAL: {hasFaceDownCards ? "?" : dealerHandValue}
            </div>
          )}
        </div>
        <div className="flex-1 p-4 min-h-[10rem] bg-white">
          <div className="flex gap-4 flex-wrap">
            <AnimatePresence mode="popLayout">
              {dealerCards.map((card, i) => (
                <motion.div
                  key={`${card.value}-${card.suite}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
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

      <div className="flex flex-col">
        {playerCards.map((hand, handIndex) => {
          const handValue = calculateHandValue(hand);
          const isCurrentHand = currentHandIndex === handIndex;
          const hasStood = stoodOnHands.has(handIndex);
          const outcome = handOutcomes.get(handIndex);

          return (
            <div
              key={handIndex}
              className={`flex flex-col md:flex-row items-start ${
                handIndex !== playerCards.length - 1
                  ? "border-b-2 border-black"
                  : ""
              }`}
            >
              <div
                className={`w-full md:w-32 p-4 border-b-2 md:border-b-0 md:border-r-2 border-black transition-colors ${
                  isCurrentHand ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                <div className="text-lg font-bold uppercase tracking-tighter">
                  {playerCards.length > 1 ? `Hand ${handIndex + 1}` : "Player"}
                </div>
                {hand.length > 0 && (
                  <div className="text-sm font-mono mt-2">
                    TOTAL: {handValue}
                  </div>
                )}
                {hasStood && !outcome && (
                  <div className="text-xs uppercase border border-current px-1 mt-2 w-fit">
                    Stood
                  </div>
                )}
                {outcome && (
                  <div
                    className={`text-xs font-bold mt-2 uppercase w-fit ${getOutcomeColorClasses(
                      outcome
                    )}`}
                  >
                    {getOutcomeMessage(outcome)}
                  </div>
                )}
              </div>
              <div className="flex-1 p-4 min-h-[10rem] flex items-center gap-4 bg-white">
                <div className="flex gap-4 flex-wrap">
                  <AnimatePresence mode="popLayout">
                    {hand.map((card, i) => (
                      <motion.div
                        key={`${card.value}-${card.suite}-${handIndex}-${i}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
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
          );
        })}
      </div>
    </div>
  );
}
