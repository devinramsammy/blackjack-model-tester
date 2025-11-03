"use client";

import { BlackjackCard, BlackjackCardType } from "./blackjack-card";
import { motion, AnimatePresence } from "motion/react";
import { useDeckStore } from "@/lib/use-deck-store";
import { canSplitHand } from "@/lib/deck-utils";

interface BlackjackTableProps {
  dealerCards?: BlackjackCardType[];
  playerCards?: BlackjackCardType[][];
}

export function BlackjackTable({
  dealerCards = [],
  playerCards = [[]],
}: BlackjackTableProps) {
  const { splitHand } = useDeckStore();
  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-start gap-6">
        <div className="text-sm font-medium w-20 flex-shrink-0 pt-1">
          Dealer
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
          return (
            <div key={handIndex} className="flex items-start gap-6">
              <div className="text-sm font-medium w-20 flex-shrink-0 pt-1">
                {playerCards.length > 1 ? `Hand ${handIndex + 1}` : "Hand"}
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
                <button
                  onClick={() => splitHand(handIndex)}
                  className="ml-auto px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  disabled={!canSplit}
                >
                  Split
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
