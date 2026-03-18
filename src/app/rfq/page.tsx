"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { rfqData, RFQ } from "@/data/sampleData";
import {
  FileSearch,
  Upload,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Star,
  Cpu,
  Lightbulb,
  BarChart3,
  Layers,
  DollarSign,
  Gauge,
  FileText,
  Zap,
  Package,
  Activity,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ---------------------------------------------------------------------------
// Helper data generators (deterministic per-RFQ)
// ---------------------------------------------------------------------------

function getCostBreakdown(rfq: RFQ) {
  const total = rfq.estimatedCost;
  const material = +(total * 0.38).toFixed(2);
  const tooling = +(total * 0.18).toFixed(2);
  const labor = +(total * 0.22).toFixed(2);
  const overhead = +(total - material - tooling - labor).toFixed(2);
  return [
    { name: "Material", value: material, color: "#06b6d4" },
    { name: "Tooling", value: tooling, color: "#8b5cf6" },
    { name: "Labor", value: labor, color: "#f59e0b" },
    { name: "Overhead & Quality", value: overhead, color: "#ef4444" },
  ];
}

function getLeadTimePhases(rfq: RFQ) {
  const total = rfq.leadTime;
  const tooling = Math.round(total * 0.4);
  const sampling = Math.round(total * 0.15);
  const ppap = Math.round(total * 0.2);
  const production = total - tooling - sampling - ppap;
  return [
    { name: "Tooling Build", weeks: tooling, color: "#8b5cf6", start: 0 },
    { name: "Sampling & Tryout", weeks: sampling, color: "#06b6d4", start: tooling },
    { name: "PPAP & Validation", weeks: ppap, color: "#f59e0b", start: tooling + sampling },
    { name: "Production Ramp", weeks: production, color: "#22c55e", start: tooling + sampling + ppap },
  ];
}

function getSimilarParts(rfq: RFQ) {
  const similar = [
    {
      name: "Front Door Outer LH (current)",
      similarity: 94,
      ppm: 12,
      cpk: 1.72,
      onTimeDelivery: 98.2,
    },
    {
      name: "Rear Door Outer LH",
      similarity: 81,
      ppm: 18,
      cpk: 1.58,
      onTimeDelivery: 96.8,
    },
    {
      name: "Hood Outer (aluminum variant)",
      similarity: 67,
      ppm: 24,
      cpk: 1.45,
      onTimeDelivery: 95.1,
    },
  ];
  if (rfq.complexity === "medium") {
    return [
      { name: "Front Cross-Member (DP780)", similarity: 88, ppm: 8, cpk: 1.82, onTimeDelivery: 99.1 },
      { name: "Rear Cross-Member (DP590)", similarity: 76, ppm: 14, cpk: 1.65, onTimeDelivery: 97.5 },
    ];
  }
  if (rfq.id === "RFQ-2026-003") {
    return [
      { name: "A-Pillar Reinforcement LH (22MnB5)", similarity: 79, ppm: 15, cpk: 1.61, onTimeDelivery: 97.2 },
      { name: "B-Pillar Reinforcement LH (22MnB5 Tailored)", similarity: 72, ppm: 22, cpk: 1.48, onTimeDelivery: 94.5 },
      { name: "Rocker Reinforcement Assembly", similarity: 64, ppm: 19, cpk: 1.53, onTimeDelivery: 96.0 },
    ];
  }
  return similar;
}

function getAIRecommendations(rfq: RFQ): string[] {
  if (rfq.id === "RFQ-2026-001") {
    return [
      "Mirror-image die design should reference LH tooling data but requires independent CAM due to coil grain direction sensitivity",
      "Recommend PVD TiAlN coating on draw die from Day 1 (lesson learned from LH hood outer galling issue QI-2025-001)",
      "Schedule springback compensation study in simulation phase - allocate 2 extra weeks for BH210 material characterization",
      "Consider dual-sourcing BH210 coil to mitigate supply risk during Phase 2 ramp-up",
      "Roller hem parameters can be carried over from LH variant with minor adjustment for RH geometry",
    ];
  }
  if (rfq.id === "RFQ-2026-002") {
    return [
      "DP980 formability window is tight - recommend full AutoForm simulation with 6-sigma robustness analysis before die design release",
      "Progressive die approach preferred for this geometry to minimize handling and improve dimensional consistency",
      "Projection weld schedule for DP980 coating requires 15% higher current than standard DP590 parameters",
      "Consider adding draw beads in flange area to control material flow and reduce springback",
    ];
  }
  return [
    "Mixed-material assembly (hot stamp + cold stamp) requires dedicated weld schedule development - budget 3 weeks for parameter optimization",
    "Hot stamping process for reinforcement should leverage existing HSP-1200 furnace recipe from A-pillar (PRT-008) with temperature adjustment",
    "Crash test validation at external lab is critical path - recommend early engagement with test facility to secure 8-week slot",
    "Current HSP-1200 utilization at 78% - adding this part requires careful cycle time analysis to avoid bottleneck on A-pillar and B-pillar",
    "Structural adhesive bond requires surface treatment validation for mixed-material stack-up",
    "Consider adding ultrasonic spot weld inspection for safety-critical mixed-thickness welds",
  ];
}

function getStatusInfo(rfq: RFQ) {
  if (rfq.feasibilityScore >= 90) return { label: "Feasible", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
  if (rfq.feasibilityScore >= 75) return { label: "Review Required", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
  return { label: "High Risk", color: "bg-red-500/20 text-red-400 border-red-500/30" };
}

function getComplexityStars(complexity: string) {
  const map: Record<string, number> = { low: 1, medium: 2, high: 3 };
  return map[complexity] ?? 1;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FeasibilityGauge({ score }: { score: number }) {
  const radius = 70;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 90 ? "#22c55e" : score >= 75 ? "#f59e0b" : "#ef4444";
  const bgColor =
    score >= 90 ? "rgba(34,197,94,0.1)" : score >= 75 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="100" viewBox="0 0 160 100">
        <path
          d="M 10 90 A 70 70 0 0 1 150 90"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 10 90 A 70 70 0 0 1 150 90"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text
          x="80"
          y="78"
          textAnchor="middle"
          className="fill-white text-3xl font-bold"
          style={{ fontSize: "32px" }}
        >
          {score}
        </text>
        <text
          x="80"
          y="95"
          textAnchor="middle"
          className="fill-gray-400"
          style={{ fontSize: "11px" }}
        >
          / 100
        </text>
      </svg>
      <span
        className="mt-1 text-xs font-semibold px-3 py-1 rounded-full"
        style={{ color, backgroundColor: bgColor }}
      >
        {score >= 90 ? "GO" : score >= 75 ? "CONDITIONAL" : "NO-GO"}
      </span>
    </div>
  );
}

function RiskList({ risks }: { risks: string[] }) {
  const severityIcon = (index: number) => {
    if (index === 0) return <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />;
    if (index < 3) return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
    return <Activity className="w-4 h-4 text-blue-400 shrink-0" />;
  };
  const severityBorder = (index: number) => {
    if (index === 0) return "border-red-500/30";
    if (index < 3) return "border-amber-500/30";
    return "border-blue-500/30";
  };

  return (
    <div className="space-y-2">
      {risks.map((risk, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border ${severityBorder(i)}`}
        >
          {severityIcon(i)}
          <span className="text-sm text-gray-300 leading-relaxed">{risk}</span>
        </div>
      ))}
    </div>
  );
}

function BOMTable({ items }: { items: RFQ["bomItems"] }) {
  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.unitCost,
    0
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-gray-400">
            <th className="text-left py-2 pr-4 font-medium">Component</th>
            <th className="text-right py-2 px-3 font-medium">Qty</th>
            <th className="text-right py-2 px-3 font-medium">Unit Cost</th>
            <th className="text-right py-2 pl-3 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={i}
              className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-2 pr-4 text-gray-300">{item.name}</td>
              <td className="py-2 px-3 text-right text-gray-400">
                {item.quantity}
              </td>
              <td className="py-2 px-3 text-right text-gray-400">
                ${item.unitCost.toFixed(2)}
              </td>
              <td className="py-2 pl-3 text-right text-white font-medium">
                ${(item.quantity * item.unitCost).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-cyan-500/30">
            <td colSpan={3} className="py-3 text-right font-semibold text-cyan-400">
              Total Estimated Part Cost
            </td>
            <td className="py-3 pl-3 text-right font-bold text-white text-base">
              ${subtotal.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function CostPieChart({ rfq }: { rfq: RFQ }) {
  const data = getCostBreakdown(rfq);

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#f1f5f9",
                fontSize: "12px",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3 flex-1">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-300">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white">
                ${item.value.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500">
                ({((item.value / rfq.estimatedCost) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadTimeGantt({ rfq }: { rfq: RFQ }) {
  const phases = getLeadTimePhases(rfq);
  const total = rfq.leadTime;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>Week 0</span>
        <span>Week {total}</span>
      </div>
      <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
        {phases.map((phase) => (
          <div
            key={phase.name}
            className="absolute top-0 h-full rounded-full"
            style={{
              left: `${(phase.start / total) * 100}%`,
              width: `${(phase.weeks / total) * 100}%`,
              backgroundColor: phase.color,
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {phases.map((phase) => (
          <div
            key={phase.name}
            className="flex items-center gap-2 text-sm"
          >
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: phase.color }}
            />
            <span className="text-gray-400">{phase.name}</span>
            <span className="text-gray-500 text-xs ml-auto">
              {phase.weeks}w
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoricalComparison({ rfq }: { rfq: RFQ }) {
  const similar = getSimilarParts(rfq);

  return (
    <div className="space-y-3">
      {similar.map((part) => (
        <div
          key={part.name}
          className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-200">
              {part.name}
            </span>
            <span className="text-xs text-cyan-400 font-semibold">
              {part.similarity}% match
            </span>
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <span>
              PPM:{" "}
              <span
                className={
                  part.ppm <= 15 ? "text-emerald-400" : "text-amber-400"
                }
              >
                {part.ppm}
              </span>
            </span>
            <span>
              Cpk:{" "}
              <span
                className={
                  part.cpk >= 1.67 ? "text-emerald-400" : "text-amber-400"
                }
              >
                {part.cpk}
              </span>
            </span>
            <span>
              OTD:{" "}
              <span
                className={
                  part.onTimeDelivery >= 97
                    ? "text-emerald-400"
                    : "text-amber-400"
                }
              >
                {part.onTimeDelivery}%
              </span>
            </span>
          </div>
          {/* Similarity bar */}
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-cyan-500/60"
              style={{ width: `${part.similarity}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RFQ Card
// ---------------------------------------------------------------------------

function RFQCard({ rfq }: { rfq: RFQ }) {
  const [expanded, setExpanded] = useState(false);
  const status = getStatusInfo(rfq);
  const stars = getComplexityStars(rfq.complexity);
  const recommendations = getAIRecommendations(rfq);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-white/[0.1]">
      {/* Card header */}
      <div
        className="p-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div className="flex-1 space-y-3">
            {/* ID + Status */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">
                {rfq.id}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${status.color}`}
              >
                {status.label}
              </span>
            </div>

            {/* Part name + customer */}
            <div>
              <h3 className="text-lg font-semibold text-white">
                {rfq.partName}
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">{rfq.customerName}</p>
            </div>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Layers className="w-3.5 h-3.5 text-gray-500" />
                <span>{rfq.material}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Package className="w-3.5 h-3.5 text-gray-500" />
                <span>{rfq.dimensions}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div className="text-gray-400">
                Annual Volume:{" "}
                <span className="text-white font-medium">
                  {rfq.annualVolume.toLocaleString()}
                </span>
              </div>
              <div className="text-gray-400">
                Est. Cost:{" "}
                <span className="text-white font-medium">
                  ${rfq.estimatedCost.toFixed(2)} / unit
                </span>
              </div>
              <div className="text-gray-400">
                Lead Time:{" "}
                <span className="text-white font-medium">
                  {rfq.leadTime} weeks
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                Complexity:{" "}
                <span className="flex ml-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < stars
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Mini gauge + toggle */}
          <div className="flex items-center gap-4">
            <FeasibilityGauge score={rfq.feasibilityScore} />
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400">
              {expanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-white/[0.06] p-6 space-y-8">
          {/* Grid layout for sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feasibility Analysis */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Feasibility Analysis
                </h4>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <FeasibilityGauge score={rfq.feasibilityScore} />
                <div className="mt-4 text-center text-xs text-gray-500 space-y-1">
                  <p>Based on material formability, tooling complexity,</p>
                  <p>process capability, and historical quality data</p>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Risk Assessment
                </h4>
              </div>
              <RiskList risks={rfq.riskFactors} />
            </div>

            {/* BOM Breakdown */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-400" />
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Bill of Materials Breakdown
                </h4>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <BOMTable items={rfq.bomItems} />
              </div>
            </div>

            {/* Cost Estimate */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Cost Estimate Breakdown
                </h4>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <CostPieChart rfq={rfq} />
              </div>
            </div>

            {/* Historical Comparison */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Similar Parts in Database
                </h4>
              </div>
              <HistoricalComparison rfq={rfq} />
            </div>

            {/* AI Recommendations */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                  AI Recommendations
                </h4>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/[0.03] to-transparent border border-amber-500/10">
                <ul className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-gray-300 leading-relaxed">
                        {rec}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Lead Time Estimate */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Lead Time Estimate - {rfq.leadTime} Weeks Total
                </h4>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <LeadTimeGantt rfq={rfq} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quote Comparison Table
// ---------------------------------------------------------------------------

function QuoteComparisonTable() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">
            Quote Comparison
          </h3>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Side-by-side analysis of all active RFQs
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-6 text-gray-400 font-medium">
                Metric
              </th>
              {rfqData.map((rfq) => (
                <th
                  key={rfq.id}
                  className="text-center py-3 px-4 text-gray-400 font-medium"
                >
                  <div className="text-cyan-400 font-mono text-xs">
                    {rfq.id}
                  </div>
                  <div className="text-white text-xs mt-1 max-w-[200px] truncate">
                    {rfq.partName}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              {
                label: "Customer",
                values: rfqData.map((r) => r.customerName),
              },
              {
                label: "Material",
                values: rfqData.map((r) => r.material),
              },
              {
                label: "Annual Volume",
                values: rfqData.map((r) => r.annualVolume.toLocaleString()),
              },
              {
                label: "Complexity",
                values: rfqData.map((r) => r.complexity.toUpperCase()),
                colorize: true,
              },
              {
                label: "Unit Cost",
                values: rfqData.map((r) => `$${r.estimatedCost.toFixed(2)}`),
              },
              {
                label: "Annual Value",
                values: rfqData.map(
                  (r) =>
                    `$${(r.estimatedCost * r.annualVolume).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}`
                ),
              },
              {
                label: "Lead Time",
                values: rfqData.map((r) => `${r.leadTime} weeks`),
              },
              {
                label: "Feasibility",
                values: rfqData.map((r) => `${r.feasibilityScore}/100`),
                colorize: true,
              },
              {
                label: "Risk Factors",
                values: rfqData.map((r) => `${r.riskFactors.length} identified`),
              },
              {
                label: "BOM Items",
                values: rfqData.map((r) => `${r.bomItems.length} components`),
              },
            ].map((row) => (
              <tr
                key={row.label}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3 px-6 text-gray-400 font-medium">
                  {row.label}
                </td>
                {row.values.map((val, i) => {
                  let textClass = "text-gray-200";
                  if (row.colorize && row.label === "Feasibility") {
                    const score = rfqData[i].feasibilityScore;
                    textClass =
                      score >= 90
                        ? "text-emerald-400 font-semibold"
                        : score >= 75
                        ? "text-amber-400 font-semibold"
                        : "text-red-400 font-semibold";
                  }
                  if (row.colorize && row.label === "Complexity") {
                    const c = rfqData[i].complexity;
                    textClass =
                      c === "low"
                        ? "text-emerald-400"
                        : c === "medium"
                        ? "text-amber-400"
                        : "text-red-400";
                  }
                  return (
                    <td
                      key={i}
                      className={`py-3 px-4 text-center text-sm ${textClass}`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Processing Animation Steps
// ---------------------------------------------------------------------------

const processingSteps = [
  "Reading 2D drawing...",
  "Extracting dimensions...",
  "Identifying material specifications...",
  "Analyzing bill of materials...",
  "Cross-referencing historical data...",
  "Calculating feasibility score...",
];

function ProcessingAnimation() {
  return (
    <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex items-center justify-center w-5 h-5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-40" />
          <Cpu className="w-4 h-4 text-cyan-400 relative" />
        </div>
        <span className="text-sm font-medium text-cyan-400">
          AI Analysis in Progress
        </span>
      </div>
      <div className="space-y-2">
        {processingSteps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 text-sm"
            style={{
              animation: `fadeSlideIn 0.4s ease-out ${i * 0.5}s both`,
            }}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-gray-300">{step}</span>
            <span className="text-emerald-400 text-xs ml-auto">
              Complete
            </span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function RFQPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20">
                <FileSearch className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  RFQ Intelligence Engine
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  AI-Powered Quote Analysis &amp; Risk Assessment
                </p>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-6">
            <div className="border-2 border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-cyan-500/30 hover:bg-cyan-500/[0.02] transition-all duration-300 cursor-pointer group">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 mb-4 group-hover:border-cyan-500/30 transition-colors">
                <Upload className="w-8 h-8 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Drop 2D Drawing or BOM here
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                or click to browse files
              </p>
              <button className="px-5 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors">
                Browse Files
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: PDF, DXF, STEP, CSV, XLSX
              </p>
            </div>

            {/* Processing animation */}
            <ProcessingAnimation />
          </div>

          {/* RFQ Cards */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Active RFQs
              </h2>
              <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                {rfqData.length} quotes in pipeline
              </span>
            </div>
            {rfqData.map((rfq) => (
              <RFQCard key={rfq.id} rfq={rfq} />
            ))}
          </div>

          {/* Quote Comparison */}
          {rfqData.length > 1 && <QuoteComparisonTable />}
        </div>
      </main>
    </div>
  );
}
