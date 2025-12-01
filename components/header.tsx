"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useDeckStore } from "@/lib/use-deck-store";
import { useBalanceStore } from "@/lib/use-balance-store";
import { useGameStatisticsStore } from "@/lib/use-game-statistics-store";

export function Header() {
  const pathname = usePathname();
  const clearCards = useDeckStore((state) => state.clearCards);
  const resetGameState = useDeckStore((state) => state.resetGameState);
  const setSpeedMultiplier = useDeckStore((state) => state.setSpeedMultiplier);
  const resetBalance = useBalanceStore((state) => state.resetBalance);
  const resetBalanceHistory = useBalanceStore(
    (state) => state.resetBalanceHistory
  );
  const resetBetValue = useBalanceStore((state) => state.resetBetValue);
  const resetGameStatistics = useGameStatisticsStore(
    (state) => state.resetGameStatistics
  );

  useEffect(() => {
    clearCards();
    resetGameState();
    setSpeedMultiplier(5);
    resetBalance();
    resetBalanceHistory();
    resetBetValue();
    resetGameStatistics();
  }, [
    pathname,
    clearCards,
    resetGameState,
    setSpeedMultiplier,
    resetBalance,
    resetBalanceHistory,
    resetBetValue,
    resetGameStatistics,
  ]);

  const navItems = [
    { name: "SIM", href: "/" },
    { name: "PLAY", href: "/play" },
  ];

  return (
    <header className="col-span-1 md:col-span-12 flex flex-col sm:flex-row h-auto sm:h-12 border-b-2 border-black bg-white">
      <div className="flex items-center justify-between sm:justify-start px-2 sm:px-4 border-b-2 sm:border-b-0 sm:border-r-2 border-black whitespace-nowrap min-h-[3rem] sm:min-h-0">
        <h1 className="text-base sm:text-lg font-black uppercase tracking-tighter">
          Blackjack
        </h1>
        <a
          href="https://x.com/devindevdevin"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-normal hover:underline sm:hidden"
        >
          @devindevdevin
        </a>
      </div>

      <nav className="flex h-full">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-6 sm:px-6 py-3 sm:py-0 text-sm sm:text-xs font-bold uppercase tracking-wider border-r-2 border-black hover:bg-black hover:text-white transition-colors whitespace-nowrap flex-1 sm:flex-none justify-center ",
              pathname === item.href
                ? "bg-black text-white"
                : "bg-white text-black"
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="hidden sm:flex items-center ml-auto px-4 gap-4 whitespace-nowrap">
        <a
          href="https://x.com/devindevdevin"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-normal hover:underline"
        >
          @devindevdevin
        </a>
      </div>
    </header>
  );
}
