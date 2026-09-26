"use client";

import React from "react";
import { Users, Car, FolderKanban, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { KpiCardData, MetricPill } from "@/types/dashboard";

interface WelcomeHeaderProps {
  userName: string;
  inlineMetrics: MetricPill[];
  kpis: KpiCardData[];
  onKpiClick?: (kpiId: string) => void;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  userName,
  inlineMetrics,
  kpis,
  onKpiClick,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Users":
        return <Users className="w-3.5 h-3.5 text-black/60" />;
      case "Car":
        return <Car className="w-3.5 h-3.5 text-black/60" />;
      case "FolderKanban":
        return <FolderKanban className="w-3.5 h-3.5 text-black/60" />;
      default:
        return <ArrowUpRight className="w-3.5 h-3.5 text-black/60" />;
    }
  };

  return (
    <section className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
      {/* Left: Greeting + Inline Segmented Metric Pills */}
      <div className="flex-1">
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-[#1A1A1A] leading-tight mb-4">
          Welcome back, <span className="text-[#1A1A1A]">{userName}</span>
        </h1>

        {/* 4 inline stat pills */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {inlineMetrics.map((metric) => {
            if (metric.variant === "dark") {
              return (
                <div key={metric.id} className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-black/50 ml-1">
                    {metric.label}
                  </span>
                  <div className="bg-[#1A1A1A] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-tight shadow-xs flex items-center justify-center min-w-[58px]">
                    {metric.value}
                  </div>
                </div>
              );
            }

            if (metric.variant === "yellow") {
              return (
                <div key={metric.id} className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-black/50 ml-1">
                    {metric.label}
                  </span>
                  <div className="bg-[#F5D547] text-[#1A1A1A] px-4 py-1.5 rounded-full text-xs font-bold tracking-tight shadow-xs flex items-center justify-center min-w-[58px]">
                    {metric.value}
                  </div>
                </div>
              );
            }

            if (metric.variant === "striped") {
              return (
                <div key={metric.id} className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-black/50 ml-1">
                    {metric.label}
                  </span>
                  <div className="relative bg-[#EDEAE0] bg-striped px-6 py-1.5 rounded-full text-xs font-bold text-[#1A1A1A] border border-black/10 flex items-center justify-center min-w-[72px]">
                    <span className="relative z-10">{metric.value}</span>
                  </div>
                </div>
              );
            }

            // Outline pill
            return (
              <div key={metric.id} className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-black/50 ml-1">
                  {metric.label}
                </span>
                <div className="border border-black/25 text-[#1A1A1A] px-4 py-1.5 rounded-full text-xs font-bold tracking-tight flex items-center justify-center min-w-[58px]">
                  {metric.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Far Right: 3 Large KPI Numbers stacked horizontally with small icons */}
      <div className="flex items-center gap-6 sm:gap-10 pt-2 lg:pt-0 border-t lg:border-t-0 border-black/5">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            onClick={() => onKpiClick && onKpiClick(kpi.id)}
            className="flex items-start gap-2.5 cursor-pointer group hover:opacity-85 transition-opacity"
            title={`${kpi.label}: ${kpi.value} (${kpi.trend === "up" ? "+" : ""}${kpi.changePercent}%)`}
          >
            {/* Small icon pill */}
            <div className="w-6 h-6 rounded-full bg-white/70 border border-black/5 flex items-center justify-center shrink-0 mt-1 shadow-2xs group-hover:scale-110 transition-transform">
              {getIcon(kpi.icon)}
            </div>

            {/* Big KPI number + Label */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-normal text-[#1A1A1A] tabular-nums tracking-tighter leading-none">
                  {kpi.value}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[11px] font-medium text-black/50">
                  {kpi.label}
                </span>
                {kpi.trend === "up" ? (
                  <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1 rounded-sm flex items-center">
                    +{kpi.changePercent}%
                  </span>
                ) : (
                  <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 px-1 rounded-sm flex items-center">
                    {kpi.changePercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
