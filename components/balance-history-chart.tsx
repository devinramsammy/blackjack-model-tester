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
    chart1: "#000000",
    mutedForeground: "#000000",
    muted: "#eeeeee",
  });

  useEffect(() => {
    setColors({
      chart1: "#000000",
      mutedForeground: "#000000",
      muted: "#cccccc",
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
      legend: {
        show: false,
      },
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
      <div className="w-full p-4 bg-white border-2 border-black">
        <h2 className="text-lg font-bold uppercase tracking-tighter mb-4 font-mono">
          Balance History
        </h2>
        <div className="flex items-center justify-center h-[300px] font-mono text-sm">
          NO DATA
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-white border-2 border-black">
      <h2 className="text-lg font-bold uppercase tracking-tighter mb-4 font-mono">
        Balance History
      </h2>
      <div ref={containerRef} className="w-full">
        <UplotReact options={options} data={data} />
      </div>
    </div>
  );
}
