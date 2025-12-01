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
  const [colors] = useState({
    chart1: "#000000",
    mutedForeground: "#000000",
    muted: "#cccccc",
  });

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
      height: 250,
      legend: {
        show: false,
      },
      scales: {
        x: {
          time: false,
        },
        y: {
          range: (_u, _dataMin, dataMax) => [0, dataMax + 100],
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
          gap: -2,
        },
      ],
    }),
    [colors, width]
  );

  return (
    <div className="w-full h-[326px] p-4 bg-white border-2 border-black">
      <h2 className="text-lg font-bold uppercase tracking-tighter mb-4 font-mono">
        Balance History
      </h2>
      <div ref={containerRef} className="w-full">
        <UplotReact options={options} data={data} />
      </div>
    </div>
  );
}
