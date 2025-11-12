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
      expect(state.balance).toBe(1000);
    });

    it("should have initial betValue of 10", () => {
      const state = useBalanceStore.getState();
      expect(state.betValue).toBe(10);
    });

    it("should have balanceHistory initialized with starting balance", () => {
      const state = useBalanceStore.getState();
      expect(state.balanceHistory).toEqual([1000]);
    });
  });

  describe("getBalance", () => {
    it("should return current balance", () => {
      const state = useBalanceStore.getState();
      expect(state.getBalance()).toBe(1000);
    });

    it("should return updated balance after updateBalance", () => {
      const state = useBalanceStore.getState();
      state.updateBalance(50);
      expect(state.getBalance()).toBe(1050);
    });
  });

  describe("updateBalance", () => {
    it("should add positive amount to balance", () => {
      const state = useBalanceStore.getState();
      state.updateBalance(100);
      expect(state.balance).toBe(1100);
    });

    it("should subtract negative amount from balance", () => {
      const state = useBalanceStore.getState();
      state.updateBalance(-50);
      expect(state.balance).toBe(950);
    });

    it("should handle zero amount", () => {
      const state = useBalanceStore.getState();
      const initialBalance = state.balance;
      state.updateBalance(0);
      expect(state.balance).toBe(initialBalance);
    });

    it("should update balanceHistory when balance changes", () => {
      const state = useBalanceStore.getState();
      state.updateBalance(100);
      expect(state.balanceHistory).toEqual([1000, 1100]);
    });

    it("should maintain balanceHistory for multiple updates", () => {
      const state = useBalanceStore.getState();
      state.updateBalance(50);
      state.updateBalance(-25);
      state.updateBalance(100);
      expect(state.balanceHistory).toEqual([1000, 1050, 1025, 1125]);
    });

    it("should allow balance to go negative", () => {
      const state = useBalanceStore.getState();
      state.updateBalance(-1500);
      expect(state.balance).toBe(-500);
      expect(state.balanceHistory).toContain(-500);
    });
  });

  describe("resetBalance", () => {
    it("should reset balance to default 1000 when no parameter provided", () => {
      const state = useBalanceStore.getState();
      state.updateBalance(500);
      state.resetBalance();
      expect(state.balance).toBe(1000);
    });

    it("should reset balance to provided initialBalance", () => {
      const state = useBalanceStore.getState();
      state.updateBalance(200);
      state.resetBalance(500);
      expect(state.balance).toBe(500);
    });

    it("should reset balanceHistory when resetting balance", () => {
      const state = useBalanceStore.getState();
      state.updateBalance(100);
      state.updateBalance(50);
      state.resetBalance(750);
      expect(state.balanceHistory).toEqual([750]);
    });

    it("should reset balanceHistory with default value when no parameter", () => {
      const state = useBalanceStore.getState();
      state.updateBalance(100);
      state.resetBalance();
      expect(state.balanceHistory).toEqual([1000]);
    });
  });

  describe("setBetValue", () => {
    it("should update betValue", () => {
      const state = useBalanceStore.getState();
      state.setBetValue(25);
      expect(state.betValue).toBe(25);
    });

    it("should allow setting betValue to different values", () => {
      const state = useBalanceStore.getState();
      state.setBetValue(50);
      expect(state.betValue).toBe(50);
      state.setBetValue(100);
      expect(state.betValue).toBe(100);
    });

    it("should allow setting betValue to zero", () => {
      const state = useBalanceStore.getState();
      state.setBetValue(0);
      expect(state.betValue).toBe(0);
    });
  });

  describe("getBetValue", () => {
    it("should return current betValue", () => {
      const state = useBalanceStore.getState();
      expect(state.getBetValue()).toBe(10);
    });

    it("should return updated betValue after setBetValue", () => {
      const state = useBalanceStore.getState();
      state.setBetValue(30);
      expect(state.getBetValue()).toBe(30);
    });
  });
});
