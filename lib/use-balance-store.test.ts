import { describe, it, expect, beforeEach } from "vitest";
import { useBalanceStore } from "./use-balance-store";

describe("useBalanceStore", () => {
  beforeEach(() => {
    useBalanceStore.getState().resetBalance(1000);
    useBalanceStore.getState().setBetValue(10);
  });

  describe("Initial State", () => {
    it("should have initial balance of 1000", () => {
      const state = useBalanceStore.getState();
      expect(state.getBalance()).toBe(1000);
    });

    it("should have initial betValue of 10", () => {
      const state = useBalanceStore.getState();
      expect(state.betValue).toBe(10);
    });

    it("should have balanceHistory initialized with starting balance", () => {
      const state = useBalanceStore.getState();
      expect(state.getBalanceHistory()).toEqual([1000]);
    });
  });

  describe("getBalance", () => {
    it("should return current balance", () => {
      const state = useBalanceStore.getState();
      expect(state.getBalance()).toBe(1000);
    });

    it("should return updated balance after updateBalance", () => {
      useBalanceStore.getState().updateBalance(50);
      const state = useBalanceStore.getState();
      expect(state.getBalance()).toBe(1050);
    });
  });

  describe("updateBalance", () => {
    it("should add positive amount to balance", () => {
      useBalanceStore.getState().updateBalance(100);
      const state = useBalanceStore.getState();
      expect(state.getBalance()).toBe(1100);
    });

    it("should subtract negative amount from balance", () => {
      useBalanceStore.getState().updateBalance(-50);
      const state = useBalanceStore.getState();
      expect(state.getBalance()).toBe(950);
    });

    it("should handle zero amount", () => {
      const state = useBalanceStore.getState();
      const initialBalance = state.getBalance();
      state.updateBalance(0);
      const updatedState = useBalanceStore.getState();
      expect(updatedState.getBalance()).toBe(initialBalance);
    });

    it("should update balanceHistory when balance changes", () => {
      useBalanceStore.getState().updateBalance(100);
      const state = useBalanceStore.getState();
      expect(state.getBalanceHistory()).toEqual([1000, 1100]);
    });

    it("should maintain balanceHistory for multiple updates", () => {
      const state = useBalanceStore.getState();
      state.updateBalance(50);
      state.updateBalance(-25);
      state.updateBalance(100);
      const finalState = useBalanceStore.getState();
      expect(finalState.getBalanceHistory()).toEqual([1000, 1050, 1025, 1125]);
    });

    it("should allow balance to go negative", () => {
      useBalanceStore.getState().updateBalance(-1500);
      const state = useBalanceStore.getState();
      expect(state.getBalance()).toBe(-500);
      expect(state.getBalanceHistory()).toContain(-500);
    });
  });

  describe("resetBalance", () => {
    it("should reset balance to default 1000 when no parameter provided", () => {
      useBalanceStore.getState().updateBalance(500);
      useBalanceStore.getState().resetBalance();
      const state = useBalanceStore.getState();
      expect(state.getBalance()).toBe(1000);
    });

    it("should reset balance to provided initialBalance", () => {
      useBalanceStore.getState().updateBalance(200);
      useBalanceStore.getState().resetBalance(500);
      const state = useBalanceStore.getState();
      expect(state.getBalance()).toBe(500);
    });

    it("should reset balanceHistory when resetting balance", () => {
      const state = useBalanceStore.getState();
      state.updateBalance(100);
      state.updateBalance(50);
      state.resetBalance(750);
      const finalState = useBalanceStore.getState();
      expect(finalState.getBalanceHistory()).toEqual([750]);
    });

    it("should reset balanceHistory with default value when no parameter", () => {
      useBalanceStore.getState().updateBalance(100);
      useBalanceStore.getState().resetBalance();
      const state = useBalanceStore.getState();
      expect(state.getBalanceHistory()).toEqual([1000]);
    });
  });

  describe("setBetValue", () => {
    it("should update betValue", () => {
      useBalanceStore.getState().setBetValue(25);
      const state = useBalanceStore.getState();
      expect(state.betValue).toBe(25);
    });

    it("should allow setting betValue to different values", () => {
      useBalanceStore.getState().setBetValue(50);
      let state = useBalanceStore.getState();
      expect(state.betValue).toBe(50);
      useBalanceStore.getState().setBetValue(100);
      state = useBalanceStore.getState();
      expect(state.betValue).toBe(100);
    });

    it("should allow setting betValue to zero", () => {
      useBalanceStore.getState().setBetValue(0);
      const state = useBalanceStore.getState();
      expect(state.betValue).toBe(0);
    });
  });

  describe("getBetValue", () => {
    it("should return current betValue", () => {
      const state = useBalanceStore.getState();
      expect(state.getBetValue()).toBe(10);
    });

    it("should return updated betValue after setBetValue", () => {
      useBalanceStore.getState().setBetValue(30);
      const state = useBalanceStore.getState();
      expect(state.getBetValue()).toBe(30);
    });
  });

  describe("getBalanceHistory", () => {
    it("should return current balanceHistory", () => {
      const state = useBalanceStore.getState();
      expect(state.getBalanceHistory()).toEqual([1000]);
    });

    it("should return updated balanceHistory after updateBalance", () => {
      useBalanceStore.getState().updateBalance(100);
      useBalanceStore.getState().updateBalance(-25);
      const state = useBalanceStore.getState();
      expect(state.getBalanceHistory()).toEqual([1000, 1100, 1075]);
    });
  });
});
