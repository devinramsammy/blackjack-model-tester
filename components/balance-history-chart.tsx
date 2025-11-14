"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import UplotReact from "uplot-react";
import uPlot from "uplot";
import { useBalanceStore } from "@/lib/use-balance-store";
import "uplot/dist/uPlot.min.css";

export function BalanceHistoryChart() {
  const balanceHistory = useBalanceStore((state) => state.balanceHistory);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [colors, setColors] = useState({
    chart1: "#a855f7",
    mutedForeground: "#6b7280",
    muted: "#e5e7eb",
  });

  useEffect(() => {
    const root = document.documentElement;
    const getComputedColor = (varName: string) => {
      return getComputedStyle(root).getPropertyValue(varName).trim();
    };

    setColors({
      chart1: getComputedColor("--chart-1") || "#a855f7",
      mutedForeground: getComputedColor("--muted-foreground") || "#6b7280",
      muted: getComputedColor("--muted") || "#e5e7eb",
    });
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const data = useMemo(() => {
    const xData = new Float64Array(balanceHistory.map((_, index) => index));
    const yData = new Float64Array(balanceHistory);
    return [xData, yData];
  }, [balanceHistory]);

  const options: uPlot.Options = useMemo(
    () => ({
      width: width,
      height: 300,
      scales: {
        x: {
          time: false,
        },
      },
      series: [
        {},
        {
          label: "Balance",
          stroke: colors.chart1,
          width: 2,
          points: {
            show: false,
          },
        },
      ],
      axes: [
        {
          stroke: colors.mutedForeground,
          grid: {
            show: true,
            stroke: colors.muted,
            width: 1,
          },
          values: () => [],
        },
        {
          label: "Balance ($)",
          stroke: colors.mutedForeground,
          grid: {
            show: true,
            stroke: colors.muted,
            width: 1,
          },
          side: 1,
        },
      ],
    }),
    [colors, width]
  );

  if (balanceHistory.length === 0) {
    return (
      <div className="w-full p-4 bg-card rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Balance History</h2>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No balance history available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-card rounded-lg border">
      <h2 className="text-lg font-semibold mb-4">Balance History</h2>
      <div ref={containerRef} className="w-full">
        <UplotReact options={options} data={data} />
      </div>
    </div>
  );
}
