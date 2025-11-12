import { create } from "zustand";

interface BalanceStore {
  balance: number;
  betValue: number;
  balanceHistory: number[];
  getBalance: () => number;
  updateBalance: (amount: number) => void;
  resetBalance: (initialBalance?: number) => void;
  setBetValue: (value: number) => void;
  getBetValue: () => number;
}

export const useBalanceStore = create<BalanceStore>((set, get) => ({
  balance: 1000,
  betValue: 10,
  balanceHistory: [1000],

  getBalance: () => {
    return get().balance;
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
}));
