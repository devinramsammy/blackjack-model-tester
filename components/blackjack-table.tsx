"use client";

import { BlackjackCard } from "./blackjack-card";
import { motion, AnimatePresence } from "motion/react";

interface BlackjackTableProps {
  dealerCards?: Array<{ value: string; suite: string }>;
  playerCards?: Array<{ value: string; suite: string }>;
}

export function BlackjackTable({
  dealerCards = [],
  playerCards = [],
}: BlackjackTableProps) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="text-sm mb-2">Dealer</div>
        <div className="flex gap-2">
          <AnimatePresence mode="popLayout">
            {dealerCards.map((card, i) => (
              <motion.div
                key={`${card.value}-${card.suite}-${i}`}
                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <BlackjackCard value={card.value} suite={card.suite} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div>
        <div className="text-sm mb-2">Player</div>
        <div className="flex gap-2">
          <AnimatePresence mode="popLayout">
            {playerCards.map((card, i) => (
              <motion.div
                key={`${card.value}-${card.suite}-${i}`}
                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <BlackjackCard value={card.value} suite={card.suite} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
