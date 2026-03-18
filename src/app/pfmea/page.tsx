"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Shield,
  Sparkles,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  pfmeaData,
  controlPlans,
  standards,
} from "@/data/sampleData";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rpnColor(rpn: number): string {
  if (rpn > 200) return "text-red-400";
  if (rpn > 100) return "text-amber-400";
  return "text-emerald-400";
}

function rpnBg(rpn: number): string {
  if (rpn > 200) return "bg-red-500/20 text-red-300 border border-red-500/30";
  if (rpn > 100)
    return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
  return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
}

function rpnRowGlow(rpn: number): string {
  if (rpn > 200) return "bg-red-500/[0.06] shadow-[inset_0_0_20px_rgba(239,68,68,0.08)]";
  if (rpn > 100) return "bg-amber-500/[0.03]";
  return "";
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    open: "bg-red-500/20 text-red-300 border border-red-500/30",
    "in-progress": "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    completed:
      "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    deferred: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
  };
  return map[status] ?? "bg-gray-500/20 text-gray-400";
}

function standardStatusBadge(status: "current" | "needs-update" | "outdated") {
  if (status === "current")
    return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
  if (status === "needs-update")
    return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
  return "bg-red-500/20 text-red-300 border border-red-500/30";
}

function scatterColor(rpn: number): string {
  if (rpn > 200) return "#ef4444";
  if (rpn > 100) return "#f59e0b";
  return "#10b981";
}

// Sort PFMEA descending by RPN
const sortedPfmea = [...pfmeaData].sort((a, b) => b.rpn - a.rpn);

// Scatter data
const scatterData = pfmeaData.map((e) => ({
  x: e.occurrence,
  y: e.severity,
  z: e.detection * 30,
  rpn: e.rpn,
  name: e.processStep,
  id: e.id,
}));

// Compliance donut
const compliant = controlPlans.filter((c) => c.isCompliant).length;
const nonCompliant = controlPlans.length - compliant;
const compliancePct = Math.round((compliant / controlPlans.length) * 100);
const donutData = [
  { name: "Compliant", value: compliant, fill: "#10b981" },
  { name: "Non-Compliant", value: nonCompliant, fill: "#ef4444" },
];

// ---------------------------------------------------------------------------
// Mock AI Compliance Data
// ---------------------------------------------------------------------------

const aiComplianceResults = {
  score: 87,
  gaps: [
    {
      id: "GAP-001",
      description:
        "Missing control plan for weld spatter detection on Station W-203 (Rocker Panel projection weld)",
      severity: "high" as const,
      recommendation:
        "Add inline spatter detection sensor and create CP entry for weld nut push-out torque with increased frequency",
    },
    {
      id: "GAP-002",
      description:
        "Detection method outdated for hot stamping process - MPI frequency insufficient per IATF 16949:2016 clause 8.5.1.1",
      severity: "high" as const,
      recommendation:
        "Increase MPI sampling from 1/200 to 1/50 parts; add eddy current inline inspection for 100% coverage",
    },
    {
      id: "GAP-003",
      description:
        "Blanking line B3 burr measurement frequency not aligned with updated SOP-STM-042 requirements",
      severity: "medium" as const,
      recommendation:
        "Update control plan CP-008 to include burr height measurement every 500 blanks (currently 1,000)",
    },
    {
      id: "GAP-004",
      description:
        "No PFMEA entry for coil material property variation impact on springback across all aluminum parts",
      severity: "medium" as const,
      recommendation:
        "Create new PFMEA entries for PRT-001 and PRT-005 covering incoming material variation as a failure mode",
    },
    {
      id: "GAP-005",
      description:
        "Laser trim cell LT-08 calibration frequency in control plan does not match corrective action from QI-2026-002",
      severity: "low" as const,
      recommendation:
        "Update CP-008 calibration frequency from weekly to daily per corrective action recommendation",
    },
  ],
};

const gapAnalysisItems = [
  {
    id: "GA-001",
    process: "Projection Weld - Rocker Panel",
    part: "Rocker Panel Inner LH (PRT-007)",
    missing: "No control plan for spatter containment on CP800 zinc-coated material",
    recommendation:
      "Create new CP entry with inline spatter detection, weld current monitoring at 100%, and reaction plan for spatter rate > 2%",
  },
  {
    id: "GA-002",
    process: "Hot Stamp - B-Pillar Transition Zone",
    part: "B-Pillar Reinforcement LH (PRT-009)",
    missing:
      "Control plan CP-006 MPI frequency insufficient for pre-production validation phase",
    recommendation:
      "Increase MPI to 1 per 50 parts during ramp-up; add cross-section metallography 1 per 100 parts; do not reduce until 30-day zero-defect record achieved",
  },
  {
    id: "GA-003",
    process: "Draw Operation - Trunk Lid",
    part: "Trunk Lid Outer (PRT-005)",
    missing: "No control plan entry for edge waviness measurement on aluminum panels",
    recommendation:
      "Add new CP entry: edge waviness measurement via laser profilometer every 200 parts; tolerance < 0.3mm amplitude; reaction plan to increase to 100% if > 0.2mm",
  },
  {
    id: "GA-004",
    process: "Restrike Operation - Hood Outer",
    part: "Hood Outer (PRT-001)",
    missing:
      "No control plan linking incoming coil yield strength verification to restrike process parameters",
    recommendation:
      "Create CP entry for incoming material verification gate: if yield strength > 145 MPa, auto-adjust restrike tonnage +8%; add material lot tracking to SPC system",
  },
];

// ---------------------------------------------------------------------------
// Custom Tooltip for Scatter
// ---------------------------------------------------------------------------

function ScatterTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; rpn: number; x: number; y: number } }> }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#1a2332] border border-white/10 rounded-lg px-4 py-3 shadow-xl text-sm">
      <p className="text-white font-medium mb-1">{d.name}</p>
      <p className="text-gray-400">
        Severity: <span className="text-white">{d.y}</span> | Occurrence:{" "}
        <span className="text-white">{d.x}</span>
      </p>
      <p className={`font-semibold mt-1 ${rpnColor(d.rpn)}`}>RPN: {d.rpn}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PFMEAPage() {
  const [tab, setTab] = useState<"pfmea" | "control">("pfmea");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [expandedGap, setExpandedGap] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-[#0a0f1a] text-gray-100 overflow-hidden">
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Tab bar */}
        <div className="sticky top-0 z-20 bg-[#0a0f1a]/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-1 px-8 pt-4">
            <button
              onClick={() => setTab("pfmea")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-medium transition-all ${
                tab === "pfmea"
                  ? "bg-white/5 text-white border-b-2 border-cyan-400"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <Shield className="w-4 h-4" />
              PFMEA
            </button>
            <button
              onClick={() => setTab("control")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-medium transition-all ${
                tab === "control"
                  ? "bg-white/5 text-white border-b-2 border-cyan-400"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              Control Plan
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* ================================================================ */}
          {/*  PFMEA TAB                                                      */}
          {/* ================================================================ */}
          {tab === "pfmea" && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      Process FMEA Analysis
                    </h1>
                    <p className="text-xs text-gray-400">
                      {pfmeaData.length} failure modes tracked &middot; sorted
                      by RPN
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAiPanel(!showAiPanel)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium shadow-lg shadow-violet-500/20 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Compliance Check
                </button>
              </div>

              {/* AI Compliance Panel */}
              {showAiPanel && (
                <div className="rounded-xl border border-violet-500/20 bg-[#12162a]/80 backdrop-blur-md p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-violet-400" />
                      <h2 className="text-lg font-semibold text-white">
                        AI Compliance Check Results
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          Standards Compliance Score
                        </p>
                        <p className="text-2xl font-bold text-violet-300">
                          {aiComplianceResults.score}%
                        </p>
                      </div>
                      <div className="w-16 h-16 rounded-full border-4 border-violet-500/30 flex items-center justify-center relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="rgba(139,92,246,0.15)"
                            strokeWidth="4"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="4"
                            strokeDasharray={`${(aiComplianceResults.score / 100) * 175.93} 175.93`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-xs font-bold text-violet-300 z-10">
                          {aiComplianceResults.score}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gaps */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-300">
                      Gaps Found ({aiComplianceResults.gaps.length})
                    </h3>
                    {aiComplianceResults.gaps.map((gap) => (
                      <div
                        key={gap.id}
                        className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                                gap.severity === "high"
                                  ? "bg-red-400"
                                  : gap.severity === "medium"
                                  ? "bg-amber-400"
                                  : "bg-blue-400"
                              }`}
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-200">
                                {gap.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="text-gray-400 font-medium">
                                  Recommendation:
                                </span>{" "}
                                {gap.recommendation}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full ${
                                gap.severity === "high"
                                  ? "bg-red-500/20 text-red-300"
                                  : gap.severity === "medium"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-blue-500/20 text-blue-300"
                              }`}
                            >
                              {gap.severity}
                            </span>
                            <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 text-xs font-medium transition-colors">
                              <Zap className="w-3 h-3" />
                              Auto-Update
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RPN Risk Matrix */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6">
                <h2 className="text-sm font-semibold text-gray-300 mb-4">
                  RPN Risk Matrix &mdash; Severity vs Occurrence (bubble size =
                  Detection)
                </h2>
                <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    RPN &gt; 200
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    RPN 101-200
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    RPN &le; 100
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <ScatterChart margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Occurrence"
                      domain={[0, 11]}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      label={{
                        value: "Occurrence",
                        position: "insideBottomRight",
                        offset: -5,
                        style: { fill: "#9ca3af", fontSize: 12 },
                      }}
                      axisLine={{ stroke: "#374151" }}
                      tickLine={{ stroke: "#374151" }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Severity"
                      domain={[0, 11]}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      label={{
                        value: "Severity",
                        angle: -90,
                        position: "insideLeft",
                        style: { fill: "#9ca3af", fontSize: 12 },
                      }}
                      axisLine={{ stroke: "#374151" }}
                      tickLine={{ stroke: "#374151" }}
                    />
                    <ZAxis
                      type="number"
                      dataKey="z"
                      range={[80, 400]}
                      name="Detection"
                    />
                    <Tooltip content={<ScatterTooltip />} cursor={false} />
                    <Scatter data={scatterData} fillOpacity={0.7}>
                      {scatterData.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={scatterColor(entry.rpn)}
                          stroke={scatterColor(entry.rpn)}
                          strokeWidth={1}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* PFMEA Table */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h2 className="text-sm font-semibold text-gray-300">
                    PFMEA Register &mdash; Sorted by RPN (Descending)
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-white/5">
                        <th className="text-left px-4 py-3 font-medium">
                          Process Step
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Failure Mode
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Effect
                        </th>
                        <th className="text-center px-3 py-3 font-medium">S</th>
                        <th className="text-center px-3 py-3 font-medium">O</th>
                        <th className="text-center px-3 py-3 font-medium">D</th>
                        <th className="text-center px-3 py-3 font-medium">
                          RPN
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Current Controls
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Recommended Action
                        </th>
                        <th className="text-center px-4 py-3 font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPfmea.map((entry) => (
                        <tr
                          key={entry.id}
                          className={`border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors ${rpnRowGlow(
                            entry.rpn
                          )}`}
                        >
                          <td className="px-4 py-3 text-gray-200 font-medium max-w-[200px]">
                            {entry.processStep}
                          </td>
                          <td className="px-4 py-3 text-gray-300 max-w-[180px]">
                            {entry.potentialFailureMode}
                          </td>
                          <td className="px-4 py-3 text-gray-400 max-w-[200px] text-xs">
                            {entry.potentialEffect}
                          </td>
                          <td className="px-3 py-3 text-center text-gray-300">
                            {entry.severity}
                          </td>
                          <td className="px-3 py-3 text-center text-gray-300">
                            {entry.occurrence}
                          </td>
                          <td className="px-3 py-3 text-center text-gray-300">
                            {entry.detection}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span
                              className={`inline-flex items-center justify-center min-w-[48px] px-2 py-1 rounded-md text-xs font-bold ${rpnBg(
                                entry.rpn
                              )}`}
                            >
                              {entry.rpn}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 max-w-[220px] text-xs">
                            {entry.currentControls}
                          </td>
                          <td className="px-4 py-3 text-gray-300 max-w-[220px] text-xs">
                            {entry.recommendedAction}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${statusBadge(
                                entry.status
                              )}`}
                            >
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ================================================================ */}
          {/*  CONTROL PLAN TAB                                               */}
          {/* ================================================================ */}
          {tab === "control" && (
            <>
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Control Plan Management
                  </h1>
                  <p className="text-xs text-gray-400">
                    {controlPlans.length} control plan entries &middot;{" "}
                    {compliancePct}% compliant
                  </p>
                </div>
              </div>

              {/* Compliance Summary + Standards Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Donut */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 flex flex-col items-center justify-center">
                  <h2 className="text-sm font-semibold text-gray-300 mb-3 self-start">
                    Compliance Summary
                  </h2>
                  <div className="relative">
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {donutData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {compliancePct}%
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                        Compliant
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 mt-3 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {compliant} Compliant
                    </span>
                    <span className="flex items-center gap-1.5 text-red-400">
                      <XCircle className="w-3.5 h-3.5" />
                      {nonCompliant} Non-Compliant
                    </span>
                  </div>
                </div>

                {/* Standards Alignment */}
                <div className="lg:col-span-2 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6">
                  <h2 className="text-sm font-semibold text-gray-300 mb-4">
                    Standards Alignment
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {standards.map((std) => (
                      <div
                        key={std.id}
                        className={`rounded-lg border p-4 transition-all ${
                          std.status === "outdated"
                            ? "border-red-500/20 bg-red-500/[0.04]"
                            : "border-white/5 bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">
                              {std.name}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono">
                              {std.code}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${standardStatusBadge(
                              std.status
                            )}`}
                          >
                            {std.status === "outdated" && (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            {std.status.replace("-", " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-gray-500">
                          <span>
                            {std.applicableParts.length} part
                            {std.applicableParts.length !== 1 ? "s" : ""}
                          </span>
                          <span>&middot;</span>
                          <span>Category: {std.category}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Last updated:{" "}
                          <span className="text-gray-400">
                            {std.lastUpdated}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Control Plan Table */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h2 className="text-sm font-semibold text-gray-300">
                    Control Plan Register
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-white/5">
                        <th className="text-left px-4 py-3 font-medium">
                          Process Step
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Characteristic
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Specification
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Tolerance
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Measurement
                        </th>
                        <th className="text-center px-3 py-3 font-medium">
                          Sample
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Frequency
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Control Method
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Reaction Plan
                        </th>
                        <th className="text-center px-4 py-3 font-medium">
                          Compliant
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {controlPlans.map((cp) => (
                        <tr
                          key={cp.id}
                          className={`border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors ${
                            !cp.isCompliant
                              ? "bg-red-500/[0.04]"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3 text-gray-200 font-medium max-w-[180px]">
                            {cp.processStep}
                          </td>
                          <td className="px-4 py-3 text-gray-300 max-w-[160px]">
                            {cp.characteristic}
                          </td>
                          <td className="px-4 py-3 text-gray-400 max-w-[140px] text-xs">
                            {cp.specification}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                            {cp.tolerance}
                          </td>
                          <td className="px-4 py-3 text-gray-400 max-w-[180px] text-xs">
                            {cp.measurementMethod}
                          </td>
                          <td className="px-3 py-3 text-center text-gray-300">
                            {cp.sampleSize}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs max-w-[140px]">
                            {cp.frequency}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs max-w-[180px]">
                            {cp.controlMethod}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px]">
                            {cp.reactionPlan}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {cp.isCompliant ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Gap Analysis */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600/20">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-200">
                      AI Gap Analysis
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      Missing control plans and recommended additions
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {gapAnalysisItems.map((item) => {
                    const isExpanded = expandedGap === item.id;
                    return (
                      <div
                        key={item.id}
                        className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedGap(isExpanded ? null : item.id)
                          }
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm text-gray-200 font-medium truncate">
                                {item.process}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {item.part}
                              </p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-3 border-t border-white/5">
                            <div className="pt-3">
                              <p className="text-xs text-red-400 font-medium mb-1 flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5" />
                                Gap Identified
                              </p>
                              <p className="text-sm text-gray-300">
                                {item.missing}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-emerald-400 font-medium mb-1 flex items-center gap-1.5">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                Recommendation
                              </p>
                              <p className="text-sm text-gray-400">
                                {item.recommendation}
                              </p>
                            </div>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 text-xs font-medium transition-colors">
                              <Zap className="w-3 h-3" />
                              Generate Control Plan Entry
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
