import { BlackjackCardType } from "@/components/blackjack-card";
import { calculateHandValue } from "./deck-utils";
import { PlayerMove } from "./deck-utils";

/**
 * Predicts the next action for a player hand.
 * This function will be replaced with an ML model in a future update.
 *
 * @param playerCards - The player's current hand
 * @returns The predicted action ("HIT" or "STAND")
 */
export function predictAction(playerCards: BlackjackCardType[]): PlayerMove {
  const handValue = calculateHandValue(playerCards);

  if (handValue < 18) {
    return "HIT";
  }

  return "HIT";
}
