"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { predictions, factoryStats } from "@/data/sampleData";
import {
  Brain,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Clock,
  TrendingUp,
  Activity,
  Zap,
  Search,
  Target,
  BarChart3,
  Cpu,
  CircleDot,
  Layers,
  Calendar,
  Wrench,
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
} from "recharts";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function riskColor(probability: number) {
  if (probability > 0.7) return { text: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30", glow: "shadow-red-500/20", accent: "#ef4444" };
  if (probability >= 0.5) return { text: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30", glow: "shadow-amber-500/20", accent: "#f59e0b" };
  return { text: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", glow: "shadow-emerald-500/20", accent: "#10b981" };
}

function impactBadge(level: "high" | "medium" | "low") {
  const map = {
    high: "bg-red-500/20 text-red-300 border-red-500/30",
    medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  };
  return map[level];
}

// ---------------------------------------------------------------------------
// Circular Gauge Component
// ---------------------------------------------------------------------------

function ProbabilityGauge({ value, size = 110 }: { value: number; size?: number }) {
  const pct = Math.round(value * 100);
  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - value * circumference;
  const rc = riskColor(value);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={rc.accent}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${rc.accent}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${rc.text}`}>{pct}%</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">probability</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shimmer / AI typing animation
// ---------------------------------------------------------------------------

function ShimmerLine({ width = "w-full", delay = "0s" }: { width?: string; delay?: string }) {
  return (
    <div
      className={`h-3 rounded-full ${width} overflow-hidden`}
      style={{ animationDelay: delay }}
    >
      <div className="h-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-shimmer" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PredictionsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeInsight, setActiveInsight] = useState(0);

  useEffect(() => {
    setMounted(true);
    const iv = setInterval(() => setActiveInsight((p) => (p + 1) % 4), 4000);
    return () => clearInterval(iv);
  }, []);

  // Derived data
  const highRisk = predictions.filter((p) => p.probability > 0.7);
  const mediumRisk = predictions.filter((p) => p.probability >= 0.5 && p.probability <= 0.7);
  const lowRisk = predictions.filter((p) => p.probability < 0.5);

  // Timeline scatter data
  const timelineData = predictions.map((p, i) => ({
    x: i + 1,
    y: p.probability * 100,
    z: p.predictedAffectedParts,
    name: p.partName,
    failureMode: p.failureMode,
    timeframe: p.timeframe,
  }));

  // Historical accuracy mock data
  const accuracyData = factoryStats.monthlyData.map((m, i) => ({
    month: m.month.replace("2025", "'25").replace("2026", "'26"),
    accuracy: Math.min(100, 68 + i * 2.1 + Math.sin(i) * 3),
    predicted: m.predicted,
    actual: m.issues,
  }));

  // AI Patterns
  const aiPatterns = [
    { icon: TrendingUp, label: "Seasonal Correlation", text: "Crack defects increase 23% in winter months due to reduced material ductility at lower ambient temperatures in the stamping shop." },
    { icon: Layers, label: "Cross-Part Pattern", text: "Draw die surface degradation patterns detected across 4 Class A surface parts sharing TP-4200 press line. Coordinated die maintenance recommended." },
    { icon: Activity, label: "Material Lot Variance", text: "Yield strength trending +8% above nominal across last 3 coil lots from POSCO. Springback compensation adjustment needed on Door Outer and Fender." },
    { icon: Zap, label: "Wear Rate Acceleration", text: "Pilot pin wear rate on HP-5000 accelerating non-linearly after 60,000 hits. Recommend lowering replacement threshold from 80,000 to 70,000 hits." },
  ];

  // Maintenance schedule
  const maintenanceSchedule = [
    { part: "Hood Outer", action: "Die polish TP-4200 Stn 1", priority: "Critical", due: "Mar 28-29", color: "text-red-400" },
    { part: "Floor Pan Front", action: "Pilot pin replacement HP-5000", priority: "High", due: "Mar 28-29", color: "text-red-400" },
    { part: "Front Door Outer LH", action: "Restrike die pre-set for high-YS", priority: "High", due: "Mar 24", color: "text-amber-400" },
    { part: "Rear Quarter Panel LH", action: "Slug magnet installation", priority: "Medium", due: "Apr 5-6", color: "text-amber-400" },
    { part: "Roof Panel", action: "Trim steel re-grind + LT-08 cal", priority: "Medium", due: "Apr shutdown", color: "text-amber-400" },
    { part: "B-Pillar Reinforcement LH", action: "MPI frequency increase (1/50)", priority: "High", due: "Immediate", color: "text-red-400" },
    { part: "Wheel House Inner LH", action: "Cam spring cycle counter setup", priority: "Low", due: "May 2026", color: "text-emerald-400" },
    { part: "Trunk Lid Outer", action: "Coil storage temp controls", priority: "Medium", due: "Apr 2026", color: "text-amber-400" },
  ];

  // Cross-part analysis
  const crossPartAnalysis = [
    { group: "Class A Surface Parts", parts: ["Hood Outer", "Trunk Lid Outer", "Door Outer LH", "Fender LH"], sharedRisk: "Die surface degradation pattern", probability: 0.72 },
    { group: "Hot-Stamped Structural", parts: ["A-Pillar Reinforcement", "B-Pillar Reinforcement"], sharedRisk: "Thermal process variation", probability: 0.58 },
    { group: "Pilot-Pin Guided", parts: ["Floor Pan Front", "Quarter Panel", "Dash Panel"], sharedRisk: "Pin wear propagation", probability: 0.81 },
  ];

  return (
    <div className="flex h-screen bg-[#080c14] text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">

          {/* ----------------------------------------------------------------
              1. HEADER
          ---------------------------------------------------------------- */}
          <div className="relative">
            {/* Glowing accent border */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

            <div className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent">
                    AI Predictive Engine
                  </h1>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Machine Learning-Powered Failure Prediction
                  </p>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-gray-400">Model v3.2</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <Target className="w-4 h-4 text-violet-400" />
                  <span className="text-xs text-gray-400">Accuracy</span>
                  <span className="text-sm font-semibold text-white">{factoryStats.predictionAccuracy}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------
              2. PREDICTION SUMMARY CARDS
          ---------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* High Risk */}
            <div className="relative group rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 via-[#0f1729] to-[#0f1729] p-5 overflow-hidden transition-all hover:border-red-500/40">
              <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-red-400/80 font-medium">High Risk</p>
                  <p className="text-4xl font-bold text-red-400 mt-1">{highRisk.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Probability &gt; 70%</p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <ShieldAlert className="w-7 h-7 text-red-400" />
                </div>
              </div>
              <div className="mt-3 flex gap-1">
                {highRisk.map((p) => (
                  <div key={p.id} className="h-1.5 flex-1 rounded-full bg-red-500/60" />
                ))}
                {Array.from({ length: Math.max(0, 4 - highRisk.length) }).map((_, i) => (
                  <div key={i} className="h-1.5 flex-1 rounded-full bg-white/5" />
                ))}
              </div>
            </div>

            {/* Medium Risk */}
            <div className="relative group rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-[#0f1729] to-[#0f1729] p-5 overflow-hidden transition-all hover:border-amber-500/40">
              <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-amber-400/80 font-medium">Medium Risk</p>
                  <p className="text-4xl font-bold text-amber-400 mt-1">{mediumRisk.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Probability 50% - 70%</p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="w-7 h-7 text-amber-400" />
                </div>
              </div>
              <div className="mt-3 flex gap-1">
                {mediumRisk.map((p) => (
                  <div key={p.id} className="h-1.5 flex-1 rounded-full bg-amber-500/60" />
                ))}
                {Array.from({ length: Math.max(0, 4 - mediumRisk.length) }).map((_, i) => (
                  <div key={i} className="h-1.5 flex-1 rounded-full bg-white/5" />
                ))}
              </div>
            </div>

            {/* Low Risk */}
            <div className="relative group rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-[#0f1729] to-[#0f1729] p-5 overflow-hidden transition-all hover:border-emerald-500/40">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-emerald-400/80 font-medium">Low Risk</p>
                  <p className="text-4xl font-bold text-emerald-400 mt-1">{lowRisk.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Probability &lt; 50%</p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <ShieldCheck className="w-7 h-7 text-emerald-400" />
                </div>
              </div>
              <div className="mt-3 flex gap-1">
                {lowRisk.map((p) => (
                  <div key={p.id} className="h-1.5 flex-1 rounded-full bg-emerald-500/60" />
                ))}
                {Array.from({ length: Math.max(0, 4 - lowRisk.length) }).map((_, i) => (
                  <div key={i} className="h-1.5 flex-1 rounded-full bg-white/5" />
                ))}
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------
              3. MAIN PREDICTIONS GRID
          ---------------------------------------------------------------- */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Active Predictions</h2>
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                {predictions.length} total
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {predictions.map((pred) => {
                const rc = riskColor(pred.probability);
                const isHigh = pred.probability > 0.7;

                return (
                  <div
                    key={pred.id}
                    className={`relative rounded-2xl border ${rc.border} bg-gradient-to-br from-white/[0.03] to-[#0c1220] p-6 transition-all duration-300 hover:scale-[1.01] ${
                      isHigh ? `shadow-lg ${rc.glow} hover:shadow-xl` : "hover:shadow-md hover:shadow-white/5"
                    }`}
                  >
                    {/* High-risk animated glow */}
                    {isHigh && (
                      <div className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none animate-pulse"
                        style={{ boxShadow: `inset 0 0 30px ${rc.accent}15, 0 0 20px ${rc.accent}10` }}
                      />
                    )}

                    <div className="relative flex gap-5">
                      {/* Gauge */}
                      <div className="shrink-0">
                        <ProbabilityGauge value={pred.probability} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Title row */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-semibold text-white truncate">{pred.partName}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase border ${impactBadge(pred.impactLevel)}`}>
                              {pred.impactLevel} impact
                            </span>
                          </div>
                          <p className={`text-sm mt-0.5 ${rc.text}`}>{pred.failureMode}</p>
                        </div>

                        {/* Confidence bar */}
                        <div>
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                            <span>Confidence</span>
                            <span className="text-gray-400">{Math.round(pred.confidence * 100)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-1000"
                              style={{ width: mounted ? `${pred.confidence * 100}%` : "0%" }}
                            />
                          </div>
                        </div>

                        {/* Timeframe + Affected */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            {pred.timeframe}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs ${
                            pred.predictedAffectedParts > 300
                              ? "bg-red-500/10 border border-red-500/20 text-red-300"
                              : "bg-white/5 border border-white/10 text-gray-300"
                          }`}>
                            <CircleDot className="w-3 h-3" />
                            {pred.predictedAffectedParts.toLocaleString()} predicted parts
                            {pred.predictedAffectedParts > 300 && (
                              <AlertTriangle className="w-3 h-3 text-red-400 ml-0.5" />
                            )}
                          </span>
                        </div>

                        {/* Based on */}
                        <div className="text-xs text-gray-500 bg-white/[0.02] rounded-lg p-2.5 border border-white/5">
                          <span className="text-gray-400 font-medium">Based on: </span>
                          {pred.basedOn}
                        </div>

                        {/* Recommended Action */}
                        <div className={`text-xs rounded-lg p-3 border-l-2 ${rc.border} bg-gradient-to-r from-white/[0.03] to-transparent`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Wrench className="w-3 h-3 text-cyan-400" />
                            <span className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Recommended Action</span>
                          </div>
                          <p className="text-gray-300 leading-relaxed">{pred.recommendedAction}</p>
                        </div>

                        {/* Related Issues */}
                        {pred.relatedIssues.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Related:</span>
                            {pred.relatedIssues.map((issueId) => (
                              <Link
                                key={issueId}
                                href="/quality"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] hover:bg-violet-500/20 transition-colors"
                              >
                                <Search className="w-2.5 h-2.5" />
                                {issueId}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ----------------------------------------------------------------
              4. PREDICTION TIMELINE
          ---------------------------------------------------------------- */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-[#0c1220] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Prediction Timeline</h2>
              <span className="text-xs text-gray-500 ml-2">Bubble size = predicted affected parts</span>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Prediction"
                    domain={[0, predictions.length + 1]}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    tickFormatter={(v: number) => {
                      const p = predictions[v - 1];
                      return p ? p.partName.split(" ").slice(0, 2).join(" ") : "";
                    }}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Probability"
                    domain={[0, 100]}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    tickFormatter={(v: number) => `${v}%`}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <ZAxis type="number" dataKey="z" range={[100, 600]} name="Affected Parts" />
                  <ReTooltip
                    cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.2)" }}
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
                    }}
                    labelStyle={{ color: "#9ca3af", fontSize: 11 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any, name: any) => {
                      if (name === "Probability") return [`${value}%`, name];
                      if (name === "Affected Parts") return [Number(value).toLocaleString(), name];
                      return [value, name];
                    }}
                    labelFormatter={() => ""}
                  />
                  <Scatter data={timelineData} shape="circle">
                    {timelineData.map((entry, index) => {
                      const color = entry.y > 70 ? "#ef4444" : entry.y >= 50 ? "#f59e0b" : "#10b981";
                      return <Cell key={`cell-${index}`} fill={color} fillOpacity={0.7} stroke={color} strokeWidth={2} />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ----------------------------------------------------------------
              5. AI ANALYSIS PANEL
          ---------------------------------------------------------------- */}
          <div className="relative rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.04] via-[#0c1220] to-cyan-500/[0.03] p-6 overflow-hidden">
            {/* Decorative grid pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            />
            {/* Subtle animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-cyan-500/5 animate-pulse pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/20">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">AI Analysis Panel</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400/80">Neural network active - analyzing patterns</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pattern Recognition */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Pattern Recognition</h3>
                  </div>

                  <div className="space-y-3">
                    {aiPatterns.map((pattern, i) => {
                      const Icon = pattern.icon;
                      const isActive = i === activeInsight;

                      return (
                        <div
                          key={i}
                          className={`rounded-xl border p-4 transition-all duration-500 cursor-pointer ${
                            isActive
                              ? "border-cyan-500/30 bg-cyan-500/[0.06] shadow-lg shadow-cyan-500/10"
                              : "border-white/5 bg-white/[0.02] hover:border-white/10"
                          }`}
                          onClick={() => setActiveInsight(i)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-gray-500"}`} />
                            <span className={`text-xs font-semibold uppercase tracking-wider ${isActive ? "text-cyan-400" : "text-gray-500"}`}>
                              {pattern.label}
                            </span>
                            {isActive && (
                              <span className="ml-auto inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            )}
                          </div>
                          <p className={`text-xs leading-relaxed transition-colors duration-300 ${isActive ? "text-gray-300" : "text-gray-600"}`}>
                            {pattern.text}
                          </p>
                          {isActive && (
                            <div className="mt-2 flex gap-2">
                              <ShimmerLine width="w-3/4" />
                              <ShimmerLine width="w-1/4" delay="0.3s" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cross-Part Analysis + Maintenance Schedule */}
                <div className="space-y-6">
                  {/* Cross-Part Analysis */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="w-4 h-4 text-violet-400" />
                      <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Cross-Part Analysis</h3>
                    </div>

                    <div className="space-y-3">
                      {crossPartAnalysis.map((group, i) => (
                        <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-violet-500/20 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">{group.group}</span>
                            <span className={`text-xs font-semibold ${riskColor(group.probability).text}`}>
                              {Math.round(group.probability * 100)}% risk
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{group.sharedRisk}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {group.parts.map((part, j) => (
                              <span key={j} className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 text-[10px] border border-violet-500/15">
                                {part}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Maintenance Schedule */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Recommended Maintenance Schedule</h3>
                    </div>

                    <div className="rounded-xl border border-white/5 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-white/[0.03]">
                            <th className="text-left px-3 py-2.5 text-gray-500 font-medium uppercase tracking-wider">Part</th>
                            <th className="text-left px-3 py-2.5 text-gray-500 font-medium uppercase tracking-wider">Action</th>
                            <th className="text-left px-3 py-2.5 text-gray-500 font-medium uppercase tracking-wider">Priority</th>
                            <th className="text-left px-3 py-2.5 text-gray-500 font-medium uppercase tracking-wider">Due</th>
                          </tr>
                        </thead>
                        <tbody>
                          {maintenanceSchedule.map((row, i) => (
                            <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="px-3 py-2.5 text-gray-300 font-medium whitespace-nowrap">{row.part}</td>
                              <td className="px-3 py-2.5 text-gray-400">{row.action}</td>
                              <td className={`px-3 py-2.5 font-semibold ${row.color}`}>{row.priority}</td>
                              <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap">{row.due}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------
              6. HISTORICAL ACCURACY
          ---------------------------------------------------------------- */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-[#0c1220] p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Historical Prediction Accuracy</h2>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-0.5 rounded-full bg-cyan-400" /> Accuracy %
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-0.5 rounded-full bg-violet-400" /> Predicted Issues
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-0.5 rounded-full bg-amber-400" /> Actual Issues
                </span>
              </div>
            </div>

            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyData} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[60, 100]}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    tickFormatter={(v: number) => `${v}%`}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 6]}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
                    }}
                    labelStyle={{ color: "#9ca3af", fontSize: 11 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="accuracy"
                    name="Accuracy %"
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    dot={{ fill: "#22d3ee", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: "#22d3ee", stroke: "#111827", strokeWidth: 2 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="predicted"
                    name="Predicted Issues"
                    stroke="#a78bfa"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    dot={{ fill: "#a78bfa", strokeWidth: 0, r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="actual"
                    name="Actual Issues"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b", strokeWidth: 0, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center gap-6 pt-4 border-t border-white/5">
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-400">{factoryStats.predictionAccuracy}%</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Current Accuracy</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">+10.5%</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">vs. 12 Months Ago</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-violet-400">8</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Active Predictions</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">2,350</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Parts at Risk</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Global shimmer animation */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
