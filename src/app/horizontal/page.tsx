"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import {
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
  RefreshCw,
  Network,
  Layers,
  BarChart3,
  ShieldCheck,
  FileText,
  TrendingUp,
  DollarSign,
  Box,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  horizontalDeployments,
  parts,
  qualityIssues,
  pfmeaData,
  controlPlans,
  standards,
} from "@/data/sampleData";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const allProcesses = [
  "Stamping - Draw",
  "Stamping - Trim/Pierce",
  "Stamping - Flange/Cam",
  "Stamping - Restrike",
  "Blanking",
  "Laser Trim",
  "Hot Stamping",
  "Welding - Spot",
  "Welding - Projection",
  "Surface Inspection",
  "Dimensional CMM",
  "Assembly / Hem",
];

/** Decide which high-level processes a part goes through based on its valueStream keywords */
function partProcesses(p: (typeof parts)[0]): string[] {
  const vs = p.valueStream.join(" ").toLowerCase();
  const matched: string[] = [];
  if (vs.includes("draw")) matched.push("Stamping - Draw");
  if (vs.includes("trim") && !vs.includes("laser trim"))
    matched.push("Stamping - Trim/Pierce");
  if (vs.includes("pierce") && !matched.includes("Stamping - Trim/Pierce"))
    matched.push("Stamping - Trim/Pierce");
  if (vs.includes("flange") || vs.includes("cam"))
    matched.push("Stamping - Flange/Cam");
  if (vs.includes("restrike")) matched.push("Stamping - Restrike");
  if (vs.includes("blanking")) matched.push("Blanking");
  if (vs.includes("laser trim")) matched.push("Laser Trim");
  if (vs.includes("hot stamp") || vs.includes("furnace"))
    matched.push("Hot Stamping");
  if (vs.includes("spot weld")) matched.push("Welding - Spot");
  if (vs.includes("projection weld")) matched.push("Welding - Projection");
  if (vs.includes("surface") && (vs.includes("audit") || vs.includes("inspection")))
    matched.push("Surface Inspection");
  if (vs.includes("cmm")) matched.push("Dimensional CMM");
  if (vs.includes("hem") || vs.includes("assembly"))
    matched.push("Assembly / Hem");
  return matched;
}

/** Map deployment commonProcess text to the high-level process key that has an issue */
function deploymentProcessKey(cp: string): string | null {
  const t = cp.toLowerCase();
  if (t.includes("draw")) return "Stamping - Draw";
  if (t.includes("trim") || t.includes("pierce")) return "Stamping - Trim/Pierce";
  if (t.includes("flange") || t.includes("cam")) return "Stamping - Flange/Cam";
  if (t.includes("restrike")) return "Stamping - Restrike";
  if (t.includes("hot stamp") || t.includes("quench")) return "Hot Stamping";
  if (t.includes("weld")) return "Welding - Spot";
  return null;
}

function statusColor(status: string) {
  switch (status) {
    case "completed":
    case "verified":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "in-progress":
      return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "planned":
      return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    default:
      return "text-gray-400 bg-gray-400/10 border-gray-400/20";
  }
}

function progressBarColor(pct: number) {
  if (pct < 33) return "bg-red-500";
  if (pct < 66) return "bg-amber-500";
  return "bg-emerald-500";
}

function progressBarGlow(pct: number) {
  if (pct < 33) return "shadow-red-500/30";
  if (pct < 66) return "shadow-amber-500/30";
  return "shadow-emerald-500/30";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HorizontalDeploymentPage() {
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null);

  const selectedDeployment = useMemo(
    () => horizontalDeployments.find((d) => d.id === selectedDeploymentId) ?? null,
    [selectedDeploymentId]
  );

  // Build process-part matrix data
  const matrixData = useMemo(() => {
    const issueProcessKeys = new Set(
      horizontalDeployments
        .filter((d) => d.status !== "completed" && d.status !== "verified")
        .map((d) => deploymentProcessKey(d.commonProcess))
        .filter(Boolean) as string[]
    );
    return { issueProcessKeys };
  }, []);

  // Cross-Part Analysis data for selected deployment
  const crossPartAnalysis = useMemo(() => {
    if (!selectedDeployment) return null;

    const sourcePart = parts.find(
      (p) => p.name === selectedDeployment.sourcePartName
    );
    const affectedPartObjs = parts.filter((p) =>
      selectedDeployment.affectedParts.includes(p.name)
    );

    const relatedPfmea = pfmeaData.filter((pf) => {
      const ids = [sourcePart?.id, ...affectedPartObjs.map((a) => a.id)];
      return ids.includes(pf.partId);
    });

    const relatedControlPlans = controlPlans.filter((cp) => {
      const ids = [sourcePart?.id, ...affectedPartObjs.map((a) => a.id)];
      return ids.includes(cp.partId);
    });

    const totalVolume = affectedPartObjs.reduce(
      (sum, p) => sum + p.annualVolume,
      0
    );

    return {
      sourcePart,
      affectedPartObjs,
      relatedPfmea,
      relatedControlPlans,
      totalVolume,
    };
  }, [selectedDeployment]);

  // Standards sync data
  const standardsSyncData = useMemo(() => {
    return standards.map((std) => {
      const partSyncStatus = std.applicableParts.map((pid) => {
        const part = parts.find((p) => p.id === pid);
        const isSynced = std.status === "current";
        return { partId: pid, partName: part?.name ?? pid, synced: isSynced };
      });
      return { ...std, partSyncStatus };
    });
  }, []);

  // Impact dashboard data
  const impactData = useMemo(() => {
    const allAffected = new Set<string>();
    let totalVolume = 0;
    horizontalDeployments.forEach((d) => {
      d.affectedParts.forEach((name) => {
        if (!allAffected.has(name)) {
          allAffected.add(name);
          const part = parts.find((p) => p.name === name);
          if (part) totalVolume += part.annualVolume;
        }
      });
    });

    const processImpact: Record<string, number> = {};
    horizontalDeployments.forEach((d) => {
      const key = deploymentProcessKey(d.commonProcess) ?? d.commonProcess;
      processImpact[key] =
        (processImpact[key] || 0) + d.affectedParts.length;
    });

    const chartData = Object.entries(processImpact).map(([name, count]) => ({
      name: name.length > 18 ? name.slice(0, 18) + "..." : name,
      fullName: name,
      parts: count,
    }));

    return {
      totalPartsAffected: allAffected.size,
      annualVolume: totalVolume,
      costImpact: Math.round(totalVolume * 0.42),
      chartData,
    };
  }, []);

  const barColors = ["#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

  // -------------------------------------------------------------------------
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#0a0f1a]">
        <div className="max-w-[1440px] mx-auto px-6 py-8 space-y-8">
          {/* ============================================================= */}
          {/* HEADER                                                         */}
          {/* ============================================================= */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/20">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Horizontal Deployment Engine
                </h1>
                <p className="text-sm text-slate-400">
                  Cross-Part Problem Propagation Analysis
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* 1. ACTIVE DEPLOYMENTS                                          */}
          {/* ============================================================= */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Network className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">
                Active Deployments
              </h2>
              <span className="ml-2 text-xs text-slate-500">
                {horizontalDeployments.length} total
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {horizontalDeployments.map((dep) => {
                const sourceIssue = qualityIssues.find(
                  (qi) => qi.id === dep.sourceIssueId
                );
                const isSelected = dep.id === selectedDeploymentId;

                return (
                  <button
                    key={dep.id}
                    onClick={() =>
                      setSelectedDeploymentId(isSelected ? null : dep.id)
                    }
                    className={`text-left w-full rounded-2xl border backdrop-blur-md transition-all duration-300 p-5 ${
                      isSelected
                        ? "bg-white/[0.06] border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                        : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10"
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-slate-500">
                            {dep.id}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${statusColor(
                              dep.status
                            )}`}
                          >
                            {dep.status}
                          </span>
                        </div>
                        <p className="text-sm text-white font-medium truncate">
                          Source: {dep.sourcePartName}
                          {sourceIssue && (
                            <span className="text-slate-400 ml-1">
                              ({sourceIssue.issueType})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Common process badge */}
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-lg px-2.5 py-1">
                        <Zap className="w-3 h-3" />
                        {dep.commonProcess}
                      </span>
                    </div>

                    {/* Network visualization */}
                    <div className="relative flex items-center justify-center mb-4 py-4">
                      {/* Center node - source */}
                      <div className="relative z-10 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-cyan-400/40 shadow-lg shadow-cyan-500/10">
                        <span className="text-[10px] font-semibold text-cyan-300 text-center leading-tight px-1">
                          {dep.sourcePartName.length > 14
                            ? dep.sourcePartName.slice(0, 14) + "..."
                            : dep.sourcePartName}
                        </span>
                      </div>

                      {/* Affected parts radiate around the center */}
                      {dep.affectedParts.map((partName, i) => {
                        const total = dep.affectedParts.length;
                        const angle =
                          (i / total) * Math.PI * 2 - Math.PI / 2;
                        const radius = 72;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;

                        return (
                          <div key={partName}>
                            {/* Connection line */}
                            <svg
                              className="absolute inset-0 w-full h-full pointer-events-none"
                              style={{ zIndex: 0 }}
                            >
                              <line
                                x1="50%"
                                y1="50%"
                                x2={`calc(50% + ${x}px)`}
                                y2={`calc(50% + ${y}px)`}
                                stroke="rgba(139,92,246,0.3)"
                                strokeWidth="1.5"
                                strokeDasharray="4 3"
                              />
                            </svg>
                            {/* Node */}
                            <div
                              className="absolute z-10 flex items-center justify-center w-14 h-14 rounded-full bg-white/[0.04] border border-white/10 hover:border-violet-400/40 transition-colors"
                              style={{
                                left: `calc(50% + ${x}px - 28px)`,
                                top: `calc(50% + ${y}px - 28px)`,
                              }}
                            >
                              <span className="text-[9px] font-medium text-slate-300 text-center leading-tight px-0.5">
                                {partName.length > 12
                                  ? partName.slice(0, 12) + "..."
                                  : partName}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Standards to update */}
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                        Standards to Update
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {dep.standardsToUpdate.map((std) => (
                          <span
                            key={std}
                            className="text-[10px] text-slate-400 bg-white/[0.04] border border-white/[0.06] rounded px-2 py-0.5"
                          >
                            {std}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                          Progress
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            dep.completionPercentage < 33
                              ? "text-red-400"
                              : dep.completionPercentage < 66
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {dep.completionPercentage}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 shadow-md ${progressBarColor(
                            dep.completionPercentage
                          )} ${progressBarGlow(dep.completionPercentage)}`}
                          style={{
                            width: `${dep.completionPercentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ============================================================= */}
          {/* 2. PROCESS-PART MATRIX                                         */}
          {/* ============================================================= */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">
                Process-Part Matrix
              </h2>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="sticky left-0 z-10 bg-[#0d1321] text-left px-4 py-3 text-slate-400 font-medium min-w-[180px]">
                      Process
                    </th>
                    {parts.map((p) => (
                      <th
                        key={p.id}
                        className="px-2 py-3 text-slate-400 font-medium text-center min-w-[80px]"
                      >
                        <div className="writing-mode-vertical truncate max-w-[80px]">
                          {p.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allProcesses.map((proc) => {
                    const isIssueRow =
                      matrixData.issueProcessKeys.has(proc);
                    return (
                      <tr
                        key={proc}
                        className={`border-b border-white/[0.03] ${
                          isIssueRow ? "bg-red-500/[0.04]" : ""
                        }`}
                      >
                        <td
                          className={`sticky left-0 z-10 px-4 py-2.5 font-medium whitespace-nowrap ${
                            isIssueRow
                              ? "bg-red-500/[0.08] text-red-300"
                              : "bg-[#0d1321] text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {isIssueRow && (
                              <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                            )}
                            {proc}
                          </div>
                        </td>
                        {parts.map((p) => {
                          const procs = partProcesses(p);
                          const hasProcess = procs.includes(proc);
                          if (!hasProcess) {
                            return (
                              <td
                                key={p.id}
                                className="px-2 py-2.5 text-center"
                              >
                                <span className="text-slate-700">-</span>
                              </td>
                            );
                          }
                          // Determine cell status
                          const isAffected =
                            isIssueRow &&
                            horizontalDeployments.some(
                              (d) =>
                                (d.status === "in-progress" ||
                                  d.status === "planned") &&
                                deploymentProcessKey(d.commonProcess) ===
                                  proc &&
                                (d.affectedParts.includes(p.name) ||
                                  d.sourcePartName === p.name)
                            );
                          const needsReview =
                            isIssueRow && !isAffected && hasProcess;

                          let cellClass =
                            "w-6 h-6 rounded mx-auto flex items-center justify-center ";
                          if (isAffected) {
                            cellClass +=
                              "bg-red-500/20 border border-red-500/30";
                          } else if (needsReview) {
                            cellClass +=
                              "bg-amber-500/15 border border-amber-500/20";
                          } else {
                            cellClass +=
                              "bg-emerald-500/15 border border-emerald-500/20";
                          }

                          return (
                            <td
                              key={p.id}
                              className="px-2 py-2.5 text-center"
                            >
                              <div className={cellClass}>
                                {isAffected && (
                                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                                )}
                                {needsReview && (
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                )}
                                {!isAffected && !needsReview && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Legend */}
              <div className="flex items-center gap-5 px-4 py-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <div className="w-4 h-4 rounded bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  OK
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <div className="w-4 h-4 rounded bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                  </div>
                  Needs Review
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                    <XCircle className="w-2.5 h-2.5 text-red-400" />
                  </div>
                  Affected by Issue
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================= */}
          {/* 3. CROSS-PART ANALYSIS (shown when a deployment is selected)   */}
          {/* ============================================================= */}
          {selectedDeployment && crossPartAnalysis && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">
                  Cross-Part Analysis
                </h2>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-cyan-400 font-medium">
                  {selectedDeployment.id} - {selectedDeployment.sourcePartName}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Value Stream Comparison */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-5">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-violet-400" />
                    Value Stream Comparison
                  </h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {/* Source part */}
                    {crossPartAnalysis.sourcePart && (
                      <div>
                        <p className="text-xs font-medium text-cyan-400 mb-1.5">
                          {crossPartAnalysis.sourcePart.name} (Source)
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {crossPartAnalysis.sourcePart.valueStream.map(
                            (step, i) => {
                              const isCommon = selectedDeployment.commonProcess
                                .toLowerCase()
                                .split(" ")
                                .some(
                                  (word) =>
                                    word.length > 3 &&
                                    step.toLowerCase().includes(word)
                                );
                              return (
                                <span
                                  key={i}
                                  className={`text-[10px] px-2 py-1 rounded-md border ${
                                    isCommon
                                      ? "bg-red-500/15 border-red-500/30 text-red-300 font-semibold"
                                      : "bg-white/[0.03] border-white/[0.06] text-slate-400"
                                  }`}
                                >
                                  {step}
                                </span>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                    {/* Affected parts */}
                    {crossPartAnalysis.affectedPartObjs.map((ap) => (
                      <div key={ap.id}>
                        <p className="text-xs font-medium text-slate-300 mb-1.5">
                          {ap.name}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {ap.valueStream.map((step, i) => {
                            const isCommon = selectedDeployment.commonProcess
                              .toLowerCase()
                              .split(" ")
                              .some(
                                (word) =>
                                  word.length > 3 &&
                                  step.toLowerCase().includes(word)
                              );
                            return (
                              <span
                                key={i}
                                className={`text-[10px] px-2 py-1 rounded-md border ${
                                  isCommon
                                    ? "bg-red-500/15 border-red-500/30 text-red-300 font-semibold"
                                    : "bg-white/[0.03] border-white/[0.06] text-slate-400"
                                }`}
                              >
                                {step}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PFMEA & Control Plans + Impact */}
                <div className="space-y-5">
                  {/* PFMEA entries */}
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-5">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      PFMEA Entries to Update
                      <span className="text-xs text-slate-500 font-normal">
                        ({crossPartAnalysis.relatedPfmea.length})
                      </span>
                    </h3>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
                      {crossPartAnalysis.relatedPfmea.slice(0, 6).map((pf) => (
                        <div
                          key={pf.id}
                          className="flex items-start gap-2 text-xs p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                        >
                          <span className="text-slate-500 font-mono shrink-0">
                            {pf.id}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-300 truncate">
                              {pf.processStep}
                            </p>
                            <p className="text-slate-500 truncate">
                              {pf.potentialFailureMode}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              pf.rpn >= 150
                                ? "text-red-400 bg-red-400/10"
                                : pf.rpn >= 80
                                ? "text-amber-400 bg-amber-400/10"
                                : "text-emerald-400 bg-emerald-400/10"
                            }`}
                          >
                            RPN {pf.rpn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Control Plans */}
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-5">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      Control Plans to Review
                      <span className="text-xs text-slate-500 font-normal">
                        ({crossPartAnalysis.relatedControlPlans.length})
                      </span>
                    </h3>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-2">
                      {crossPartAnalysis.relatedControlPlans
                        .slice(0, 5)
                        .map((cp) => (
                          <div
                            key={cp.id}
                            className="flex items-center gap-2 text-xs p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                          >
                            <span className="text-slate-500 font-mono shrink-0">
                              {cp.id}
                            </span>
                            <p className="text-slate-300 flex-1 min-w-0 truncate">
                              {cp.processStep}
                            </p>
                            {cp.isCompliant ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Estimated Impact */}
                  <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-violet-500/[0.06] to-cyan-500/[0.06] backdrop-blur-md p-5">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      Estimated Impact
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                          Parts Affected
                        </p>
                        <p className="text-lg font-bold text-white">
                          {selectedDeployment.affectedParts.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                          Annual Volume at Risk
                        </p>
                        <p className="text-lg font-bold text-white">
                          {crossPartAnalysis.totalVolume.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Prompt to select */}
          {!selectedDeployment && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-8 text-center">
              <Network className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Select a deployment above to view cross-part analysis
              </p>
            </div>
          )}

          {/* ============================================================= */}
          {/* 4. STANDARDS SYNCHRONIZATION                                   */}
          {/* ============================================================= */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">
                  Standards Synchronization
                </h2>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
                <RefreshCw className="w-3.5 h-3.5" />
                Sync All
              </button>
            </div>

            {/* AI Recommendation */}
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.05] backdrop-blur-md p-4 mb-5">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/20 shrink-0 mt-0.5">
                  <Zap className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-violet-300 mb-1">
                    AI Recommendation
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Prioritize updating{" "}
                    <span className="text-violet-300 font-medium">
                      SOP-STM-015 (Die Polish Procedure)
                    </span>{" "}
                    and{" "}
                    <span className="text-violet-300 font-medium">
                      SOP-WLD-022 (Electrode Tip Management)
                    </span>{" "}
                    - these standards affect the most parts with active in-progress
                    deployments. Additionally,{" "}
                    <span className="text-violet-300 font-medium">
                      QS-HST-004 (Martensitic Transformation)
                    </span>{" "}
                    is outdated and applies to safety-critical hot-stamped
                    structural components.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {standardsSyncData.map((std) => (
                <div
                  key={std.id}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-xs font-semibold text-white truncate">
                        {std.code}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {std.name}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        std.status === "current"
                          ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                          : std.status === "needs-update"
                          ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                          : "text-red-400 bg-red-400/10 border-red-400/20"
                      }`}
                    >
                      {std.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 mb-2">
                    Last updated: {std.lastUpdated}
                  </p>

                  <div className="space-y-1">
                    {std.partSyncStatus.map((ps) => (
                      <div
                        key={ps.partId}
                        className="flex items-center justify-between text-[10px]"
                      >
                        <span className="text-slate-400 truncate mr-2">
                          {ps.partName}
                        </span>
                        {ps.synced ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ============================================================= */}
          {/* 5. IMPACT DASHBOARD                                            */}
          {/* ============================================================= */}
          <section className="pb-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">
                Impact Dashboard
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Stat cards */}
              <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                {/* Total parts affected */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/10">
                      <Box className="w-4.5 h-4.5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Total Parts Affected
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {impactData.totalPartsAffected}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Across {horizontalDeployments.length} deployments
                  </p>
                </div>

                {/* Annual parts at risk */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10">
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Annual Parts at Risk
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {impactData.annualVolume.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Sum of affected part volumes
                  </p>
                </div>

                {/* Cost impact */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-500/10">
                      <DollarSign className="w-4.5 h-4.5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Est. Cost Impact
                      </p>
                      <p className="text-2xl font-bold text-white">
                        ${(impactData.costImpact / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Based on $0.42 avg rework cost per part
                  </p>
                </div>
              </div>

              {/* Bar chart */}
              <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-5">
                <h3 className="text-sm font-semibold text-white mb-4">
                  Deployment Impact by Process Type
                </h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={impactData.chartData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.04)"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 10,
                        }}
                        angle={-30}
                        textAnchor="end"
                        axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 10 }}
                        axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                        tickLine={false}
                        label={{
                          value: "Affected Parts",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#64748b",
                          fontSize: 10,
                          offset: 10,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          color: "#e2e8f0",
                          fontSize: "12px",
                        }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any, _name: any, props: any) => [
                          `${value} parts`,
                          props?.payload?.fullName ?? "",
                        ]}
                      />
                      <Bar dataKey="parts" radius={[6, 6, 0, 0]} barSize={40}>
                        {impactData.chartData.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={barColors[index % barColors.length]}
                            fillOpacity={0.8}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
