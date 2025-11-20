import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  extractGameStateFeatures,
  preprocessFeatures,
  predictActionWithModel,
  type GameStateFeatures,
} from "./model-utils";
import { BlackjackCardType } from "@/components/blackjack-card";
import * as ort from "onnxruntime-web";

const createCard = (
  value: string,
  suite: string = "hearts"
): BlackjackCardType => ({
  value,
  suite,
  faceDown: false,
});

describe("extractGameStateFeatures", () => {
  it("should extract features for basic two-card hand", () => {
    const playerHand = [createCard("10"), createCard("5")];
    const dealerUpcard = createCard("6");
    const features = extractGameStateFeatures(playerHand, dealerUpcard);

    expect(features.dealer_upcard).toBe("6");
    expect(features.player_total).toBe("15");
    expect(features.pair_rank).toBe("none");
    expect(features.has_ace).toBe(0);
    expect(features.is_soft).toBe(0);
    expect(features.is_pair).toBe(0);
    expect(features.num_cards).toBe(2);
    expect(features.can_split).toBe(0);
    expect(features.can_double).toBe(1);
  });

  it("should detect pair and set pair_rank", () => {
    const playerHand = [createCard("A"), createCard("A")];
    const dealerUpcard = createCard("10");
    const features = extractGameStateFeatures(playerHand, dealerUpcard);

    expect(features.is_pair).toBe(1);
    expect(features.can_split).toBe(1);
    expect(features.pair_rank).toBe("11");
  });

  it("should detect ace and soft hand", () => {
    const playerHand = [createCard("A"), createCard("6")];
    const dealerUpcard = createCard("5");
    const features = extractGameStateFeatures(playerHand, dealerUpcard);

    expect(features.has_ace).toBe(1);
    expect(features.is_soft).toBe(1);
    expect(features.player_total).toBe("17");
  });

  it("should handle face cards correctly", () => {
    const playerHand = [createCard("K"), createCard("Q")];
    const dealerUpcard = createCard("J");
    const features = extractGameStateFeatures(playerHand, dealerUpcard);

    expect(features.dealer_upcard).toBe("10");
    expect(features.player_total).toBe("20");
    expect(features.pair_rank).toBe("none");
  });

  it("should handle three-card hand", () => {
    const playerHand = [createCard("5"), createCard("6"), createCard("7")];
    const dealerUpcard = createCard("10");
    const features = extractGameStateFeatures(playerHand, dealerUpcard);

    expect(features.num_cards).toBe(3);
    expect(features.can_double).toBe(0);
    expect(features.can_split).toBe(0);
  });

  it("should handle ace that becomes hard", () => {
    const playerHand = [createCard("A"), createCard("K"), createCard("5")];
    const dealerUpcard = createCard("6");
    const features = extractGameStateFeatures(playerHand, dealerUpcard);

    expect(features.has_ace).toBe(1);
    expect(features.is_soft).toBe(0);
    expect(features.player_total).toBe("16");
  });

  it("should handle number pair", () => {
    const playerHand = [createCard("8"), createCard("8")];
    const dealerUpcard = createCard("9");
    const features = extractGameStateFeatures(playerHand, dealerUpcard);

    expect(features.is_pair).toBe(1);
    expect(features.pair_rank).toBe("8");
  });
});

describe("preprocessFeatures", () => {
  it("should one-hot encode categorical features correctly", () => {
    const features: GameStateFeatures = {
      dealer_upcard: "10",
      player_total: "15",
      pair_rank: "none",
      has_ace: 0,
      is_soft: 0,
      is_pair: 0,
      num_cards: 2,
      can_split: 0,
      can_double: 1,
    };

    const preprocessed = preprocessFeatures(features);
    expect(preprocessed.length).toBe(45);

    expect(preprocessed[0]).toBe(1);
    expect(preprocessed.slice(1, 10).every((v) => v === 0)).toBe(true);

    const playerTotalStart = 10;
    expect(preprocessed[playerTotalStart + 5]).toBe(1);

    const pairRankStart = 28;
    expect(preprocessed[pairRankStart + 10]).toBe(1);

    expect(preprocessed[39]).toBe(0);
    expect(preprocessed[40]).toBe(0);
    expect(preprocessed[41]).toBe(0);
    expect(preprocessed[42]).toBe(2);
    expect(preprocessed[43]).toBe(0);
    expect(preprocessed[44]).toBe(1);
  });

  it("should encode pair rank correctly", () => {
    const features: GameStateFeatures = {
      dealer_upcard: "6",
      player_total: "12",
      pair_rank: "11",
      has_ace: 1,
      is_soft: 0,
      is_pair: 1,
      num_cards: 2,
      can_split: 1,
      can_double: 1,
    };

    const preprocessed = preprocessFeatures(features);
    const pairRankStart = 28;
    expect(preprocessed[pairRankStart + 1]).toBe(1);
  });

  it("should handle all passthrough features", () => {
    const features: GameStateFeatures = {
      dealer_upcard: "2",
      player_total: "21",
      pair_rank: "none",
      has_ace: 1,
      is_soft: 1,
      is_pair: 0,
      num_cards: 3,
      can_split: 0,
      can_double: 0,
    };

    const preprocessed = preprocessFeatures(features);
    expect(preprocessed[39]).toBe(1);
    expect(preprocessed[40]).toBe(1);
    expect(preprocessed[41]).toBe(0);
    expect(preprocessed[42]).toBe(3);
    expect(preprocessed[43]).toBe(0);
    expect(preprocessed[44]).toBe(0);
  });
});

describe("predictActionWithModel", () => {
  let mockSession: ort.InferenceSession;

  beforeEach(() => {
    mockSession = {
      inputNames: ["input"],
      outputNames: ["probabilities"],
      run: vi.fn(),
    } as unknown as ort.InferenceSession;
  });

  it("should select best action from probabilities", async () => {
    const probData = new Float32Array([0.1, 0.7, 0.1, 0.1]);
    const mockTensor = {
      data: probData,
      type: "float32",
    } as ort.Tensor;

    vi.mocked(mockSession.run).mockResolvedValue({
      probabilities: mockTensor,
    });

    const features: GameStateFeatures = {
      dealer_upcard: "10",
      player_total: "15",
      pair_rank: "none",
      has_ace: 0,
      is_soft: 0,
      is_pair: 0,
      num_cards: 2,
      can_split: 0,
      can_double: 1,
    };

    const action = await predictActionWithModel(
      mockSession,
      features,
      ["HIT", "STAND", "DOUBLE"],
      0
    );

    expect(action).toBe("STAND");
  });

  it("should filter out disallowed actions", async () => {
    const probData = new Float32Array([0.1, 0.7, 0.1, 0.1]);
    const mockTensor = {
      data: probData,
      type: "float32",
    } as ort.Tensor;

    vi.mocked(mockSession.run).mockResolvedValue({
      probabilities: mockTensor,
    });

    const features: GameStateFeatures = {
      dealer_upcard: "10",
      player_total: "15",
      pair_rank: "none",
      has_ace: 0,
      is_soft: 0,
      is_pair: 0,
      num_cards: 3,
      can_split: 0,
      can_double: 0,
    };

    const action = await predictActionWithModel(
      mockSession,
      features,
      ["HIT", "STAND"],
      0
    );

    expect(action).toBe("STAND");
  });

  it("should handle label tensor output", async () => {
    const labelData = new BigInt64Array([BigInt(1)]);
    const mockTensor = {
      data: labelData,
      type: "int64",
    } as ort.Tensor;

    vi.mocked(mockSession.run).mockResolvedValue({
      label: mockTensor,
    });

    const features: GameStateFeatures = {
      dealer_upcard: "10",
      player_total: "15",
      pair_rank: "none",
      has_ace: 0,
      is_soft: 0,
      is_pair: 0,
      num_cards: 2,
      can_split: 0,
      can_double: 1,
    };

    const action = await predictActionWithModel(
      mockSession,
      features,
      ["HIT", "STAND", "DOUBLE"],
      0
    );

    expect(action).toBe("STAND");
  });

  it("should fallback when predicted action is not allowed", async () => {
    const labelData = new BigInt64Array([BigInt(2)]);
    const mockTensor = {
      data: labelData,
      type: "int64",
    } as ort.Tensor;

    vi.mocked(mockSession.run).mockResolvedValue({
      label: mockTensor,
    });

    const features: GameStateFeatures = {
      dealer_upcard: "10",
      player_total: "15",
      pair_rank: "none",
      has_ace: 0,
      is_soft: 0,
      is_pair: 0,
      num_cards: 3,
      can_split: 0,
      can_double: 0,
    };

    const action = await predictActionWithModel(
      mockSession,
      features,
      ["HIT", "STAND"],
      0
    );

    expect(action).toBe("HIT");
  });

  it("should use temperature for probabilistic selection", async () => {
    const probData = new Float32Array([0.4, 0.3, 0.2, 0.1]);
    const mockTensor = {
      data: probData,
      type: "float32",
    } as ort.Tensor;

    vi.mocked(mockSession.run).mockResolvedValue({
      probabilities: mockTensor,
    });

    const features: GameStateFeatures = {
      dealer_upcard: "10",
      player_total: "15",
      pair_rank: "none",
      has_ace: 0,
      is_soft: 0,
      is_pair: 0,
      num_cards: 2,
      can_split: 0,
      can_double: 1,
    };

    const action = await predictActionWithModel(
      mockSession,
      features,
      ["HIT", "STAND", "DOUBLE"],
      1.0
    );

    expect(["HIT", "STAND", "DOUBLE"]).toContain(action);
  });

  it("should return first allowed action when no valid outputs", async () => {
    vi.mocked(mockSession.run).mockResolvedValue({});

    const features: GameStateFeatures = {
      dealer_upcard: "10",
      player_total: "15",
      pair_rank: "none",
      has_ace: 0,
      is_soft: 0,
      is_pair: 0,
      num_cards: 2,
      can_split: 0,
      can_double: 1,
    };

    await expect(
      predictActionWithModel(mockSession, features, ["HIT", "STAND"], 0)
    ).rejects.toThrow("No valid outputs found from model");
  });
});
