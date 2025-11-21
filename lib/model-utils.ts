import * as ort from "onnxruntime-web";
import { BlackjackCardType } from "@/components/blackjack-card";
import {
  calculateHandValue,
  canSplitHand,
  getAvailablePlayerMoves,
} from "./deck-utils";
import type { PlayerMove } from "./deck-utils";

const modelConfig = {
  categorical_values: {
    dealer_upcard: ["10", "11", "2", "3", "4", "5", "6", "7", "8", "9"],
    player_total: [
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ],
    pair_rank: ["10", "11", "2", "3", "4", "5", "6", "7", "8", "9", "none"],
  },
} as const;

const ACTION_MAP: Record<number, PlayerMove> = {
  0: "HIT",
  1: "STAND",
  2: "DOUBLE",
  3: "SPLIT",
} as const;

export interface GameStateFeatures {
  dealer_upcard: string;
  player_total: string;
  pair_rank: string;
  has_ace: number;
  is_soft: number;
  is_pair: number;
  num_cards: number;
  can_split: number;
  can_double: number;
}

export function extractGameStateFeatures(
  playerHand: BlackjackCardType[],
  dealerUpcard: BlackjackCardType
): GameStateFeatures {
  const playerTotal = calculateHandValue(playerHand);
  const hasAce = playerHand.some((card) => card.value === "A") ? 1 : 0;

  let isSoft = 0;
  if (hasAce) {
    let value = 0;
    let aces = 0;
    for (const card of playerHand) {
      if (card.value === "A") {
        aces += 1;
        value += 11;
      } else if (
        card.value === "K" ||
        card.value === "Q" ||
        card.value === "J"
      ) {
        value += 10;
      } else {
        value += parseInt(card.value, 10);
      }
    }
    if (value <= 21 && aces > 0) {
      isSoft = 1;
    }
  }

  const isPair = canSplitHand(playerHand) ? 1 : 0;
  const numCards = playerHand.length;
  const canSplit = isPair ? 1 : 0;
  const canDouble = numCards === 2 ? 1 : 0;

  const cardValueToNumeric = (value: string): string => {
    if (value === "A") {
      return "11";
    } else if (value === "K" || value === "Q" || value === "J") {
      return "10";
    }
    return value;
  };

  let pairRank = "none";
  if (isPair && playerHand.length === 2) {
    pairRank = cardValueToNumeric(playerHand[0].value);
  }

  const dealerUpcardValue = cardValueToNumeric(dealerUpcard.value);
  const playerTotalStr = playerTotal.toString();

  return {
    dealer_upcard: dealerUpcardValue,
    player_total: playerTotalStr,
    pair_rank: pairRank,
    has_ace: hasAce,
    is_soft: isSoft,
    is_pair: isPair,
    num_cards: numCards,
    can_split: canSplit,
    can_double: canDouble,
  };
}

function oneHotEncode(
  value: string,
  possibleValues: readonly string[]
): number[] {
  const index = possibleValues.indexOf(value);
  const encoding = new Array(possibleValues.length).fill(0);
  if (index !== -1) {
    encoding[index] = 1;
  }
  return encoding;
}

export function preprocessFeatures(features: GameStateFeatures): Float32Array {
  const dealerUpcardEncoded = oneHotEncode(
    features.dealer_upcard,
    modelConfig.categorical_values.dealer_upcard
  );
  const playerTotalEncoded = oneHotEncode(
    features.player_total,
    modelConfig.categorical_values.player_total
  );
  const pairRankEncoded = oneHotEncode(
    features.pair_rank,
    modelConfig.categorical_values.pair_rank
  );

  const passthrough = [
    features.has_ace,
    features.is_soft,
    features.is_pair,
    features.num_cards,
    features.can_split,
    features.can_double,
  ];

  const allFeatures = [
    ...dealerUpcardEncoded,
    ...playerTotalEncoded,
    ...pairRankEncoded,
    ...passthrough,
  ];

  return new Float32Array(allFeatures);
}

let modelSession: ort.InferenceSession | null = null;
let modelLoadingPromise: Promise<ort.InferenceSession> | null = null;

export async function loadModel(): Promise<ort.InferenceSession> {
  if (modelSession) {
    return modelSession;
  }

  if (modelLoadingPromise) {
    return modelLoadingPromise;
  }

  modelLoadingPromise = (async () => {
    const modelPath = "/model.onnx";
    ort.env.logLevel = "error";
    const session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ["wasm"],
    });
    modelSession = session;
    modelLoadingPromise = null;
    return session;
  })();

  return modelLoadingPromise;
}

export async function predictActionWithModel(
  session: ort.InferenceSession,
  features: GameStateFeatures,
  allowedActions: PlayerMove[],
  temperature: number = 0.0
): Promise<PlayerMove> {
  const input = preprocessFeatures(features);
  const tensor = new ort.Tensor("float32", input, [1, input.length]);
  const inputNames = session.inputNames;
  if (inputNames.length === 0) {
    throw new Error("Model has no input names");
  }
  const inputName = inputNames[0];
  const results = await session.run({ [inputName]: tensor });
  const outputNames = session.outputNames;
  const resultKeys = Object.keys(results);
  let probabilities: ort.Tensor | null = null;
  let labelTensor: ort.Tensor | null = null;

  for (const name of [...outputNames, ...resultKeys]) {
    const tensor = results[name];
    if (tensor && (tensor.type === "float32" || tensor.type === "float64")) {
      probabilities = tensor;
      break;
    }
  }

  for (const name of [...outputNames, ...resultKeys]) {
    const tensor = results[name];
    if (tensor && (tensor.type === "int64" || tensor.type === "int32")) {
      labelTensor = tensor;
      break;
    }
  }

  if (probabilities) {
    const probData = probabilities.data as Float32Array;
    return selectBestActionFromProbabilities(
      probData,
      allowedActions,
      temperature
    );
  }

  if (labelTensor) {
    const labelData = labelTensor.data as BigInt64Array | Int32Array;
    const predictedIndex = Number(labelData[0]);
    let predictedAction = ACTION_MAP[predictedIndex];

    if (predictedAction === "DOUBLE" && !allowedActions.includes("DOUBLE")) {
      predictedAction = allowedActions.includes("HIT") ? "HIT" : "STAND";
    }

    if (predictedAction && allowedActions.includes(predictedAction)) {
      return predictedAction;
    }

    return allowedActions[0] || "STAND";
  }

  throw new Error("No valid outputs found from model");
}

function findBestAction(
  filteredProbs: Array<{ action: PlayerMove; prob: number; index: number }>
): PlayerMove {
  let bestIndex = 0;
  let bestProb = filteredProbs[0].prob;
  for (let i = 1; i < filteredProbs.length; i++) {
    if (filteredProbs[i].prob > bestProb) {
      bestProb = filteredProbs[i].prob;
      bestIndex = i;
    }
  }
  return filteredProbs[bestIndex].action;
}

function selectBestActionFromProbabilities(
  probData: Float32Array,
  allowedActions: PlayerMove[],
  temperature: number = 0.0
): PlayerMove {
  const filteredProbs: Array<{
    action: PlayerMove;
    prob: number;
    index: number;
  }> = [];
  for (let i = 0; i < probData.length; i++) {
    const action = ACTION_MAP[i];
    if (action && allowedActions.includes(action)) {
      filteredProbs.push({ action, prob: probData[i], index: i });
    }
  }

  if (filteredProbs.length === 0) {
    return allowedActions[0] || "STAND";
  }

  const finalProbs = filteredProbs.filter(
    (p) => p.action !== "DOUBLE" || allowedActions.includes("DOUBLE")
  );

  if (finalProbs.length === 0) {
    return allowedActions[0] || "STAND";
  }

  if (temperature === 0) {
    return findBestAction(finalProbs);
  }

  const temperatureScaled = finalProbs.map((p) => {
    const logProb = Math.log(Math.max(p.prob, 1e-10));
    return Math.exp(logProb / temperature);
  });

  const sum = temperatureScaled.reduce((a, b) => a + b, 0);
  const normalizedProbs = temperatureScaled.map((p) => p / sum);

  const random = Math.random();
  let cumulative = 0;
  for (let i = 0; i < normalizedProbs.length; i++) {
    cumulative += normalizedProbs[i];
    if (random <= cumulative) {
      return finalProbs[i].action;
    }
  }
  return finalProbs[finalProbs.length - 1].action;
}

export async function predictAction(
  playerCards: BlackjackCardType[],
  dealerUpcard: BlackjackCardType,
  allowedActions?: PlayerMove[],
  temperature: number = 0.0
): Promise<PlayerMove> {
  const actions = allowedActions || getAvailablePlayerMoves(playerCards);

  if (actions.length === 0) {
    return "STAND";
  }

  const session = await loadModel();
  const features = extractGameStateFeatures(playerCards, dealerUpcard);
  return predictActionWithModel(session, features, actions, temperature);
}
