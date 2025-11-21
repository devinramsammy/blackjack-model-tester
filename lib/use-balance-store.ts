import { create } from "zustand";

interface BalanceStore {
  balance: number;
  betValue: number;
  balanceHistory: number[];
  getBalance: () => number;
  getBalanceHistory: () => number[];
  updateBalance: (amount: number) => void;
  resetBalance: (initialBalance?: number) => void;
  resetBalanceHistory: () => void;
  setBetValue: (value: number) => void;
  getBetValue: () => number;
  resetBetValue: () => void;
}

export const useBalanceStore = create<BalanceStore>((set, get) => ({
  balance: 1000,
  betValue: 100,
  balanceHistory: [1000],

  getBalance: () => {
    return get().balance;
  },

  getBalanceHistory: () => {
    return get().balanceHistory;
  },

  updateBalance: (amount: number) => {
    set((state) => {
      const newBalance = state.balance + amount;
      return {
        balance: newBalance,
        balanceHistory: [...state.balanceHistory, newBalance],
      };
    });
  },

  resetBalance: (initialBalance = 1000) => {
    set({
      balance: initialBalance,
      balanceHistory: [initialBalance],
    });
  },

  setBetValue: (value: number) => {
    set({ betValue: value });
  },

  getBetValue: () => {
    return get().betValue;
  },
  resetBalanceHistory: () => {
    set({ balanceHistory: [get().balance] });
  },
  resetBetValue: () => {
    set({ betValue: 100 });
  },
}));
