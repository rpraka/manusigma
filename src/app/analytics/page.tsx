"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import {
  qualityIssues,
  factoryStats,
} from "@/data/sampleData";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  DollarSign,
  Tag,
  Target,
  ChevronDown,
  ChevronUp,
  Wrench,
  Flame,
  Layers,
  FlaskConical,
  Truck,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

// ---------------------------------------------------------------------------
// Constants / theme colors
// ---------------------------------------------------------------------------

const CHART_COLORS = [
  "#22d3ee",
  "#a78bfa",
  "#f472b6",
  "#facc15",
  "#34d399",
  "#fb923c",
  "#60a5fa",
  "#e879f9",
  "#f87171",
  "#4ade80",
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  major: "#f59e0b",
  minor: "#22d3ee",
};

const darkTooltipStyle = {
  contentStyle: {
    backgroundColor: "#1e293b",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: 12,
  },
  itemStyle: { color: "#cbd5e1" },
  labelStyle: { color: "#f1f5f9", fontWeight: 600 },
};

// ---------------------------------------------------------------------------
// Derived data helpers
// ---------------------------------------------------------------------------

function useAnalyticsData() {
  return useMemo(() => {
    // --- KPIs ---
    const totalProblems = qualityIssues.length;
    const solvedProblems = qualityIssues.filter(
      (q) => q.status === "resolved"
    ).length;
    const solvedPct = Math.round((solvedProblems / totalProblems) * 100);
    const avgResolution = factoryStats.avgResolutionDays;
    const costOfQuality = 1_284_500; // mock
    const topCategory = (() => {
      const counts: Record<string, number> = {};
      qualityIssues.forEach((q) => {
        counts[q.issueType] = (counts[q.issueType] || 0) + 1;
      });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    })();
    const predictionAccuracy = factoryStats.predictionAccuracy;

    // --- Issue by type ---
    const issueByType: Record<string, number> = {};
    qualityIssues.forEach((q) => {
      issueByType[q.issueType] = (issueByType[q.issueType] || 0) + 1;
    });
    const issueByTypeData = Object.entries(issueByType)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // --- Issue by severity ---
    const issueBySeverity: Record<string, number> = {};
    qualityIssues.forEach((q) => {
      issueBySeverity[q.severity] = (issueBySeverity[q.severity] || 0) + 1;
    });
    const issueBySeverityData = ["critical", "major", "minor"].map((s) => ({
      severity: s.charAt(0).toUpperCase() + s.slice(1),
      count: issueBySeverity[s] || 0,
      fill: SEVERITY_COLORS[s],
    }));

    // --- Process performance (quality score per process bucket) ---
    const processGroups: Record<string, { total: number; resolved: number }> =
      {};
    qualityIssues.forEach((q) => {
      const p = q.process;
      const key = p.includes("Hot Stamping")
        ? "Hot Stamping"
        : p.includes("Welding")
        ? "Welding"
        : p.includes("Laser")
        ? "Laser Trim"
        : p.includes("Blanking") || p.includes("Blank")
        ? "Blanking"
        : p.includes("Trim") || p.includes("Pierce")
        ? "Trim / Pierce"
        : p.includes("Flange") || p.includes("Cam") || p.includes("Restrike")
        ? "Restrike / Cam"
        : p.includes("Draw")
        ? "Draw Operation"
        : p.includes("Stamping")
        ? "Stamping"
        : "Other";
      if (!processGroups[key])
        processGroups[key] = { total: 0, resolved: 0 };
      processGroups[key].total += 1;
      if (q.status === "resolved") processGroups[key].resolved += 1;
    });
    const processPerformanceData = Object.entries(processGroups)
      .map(([process, d]) => ({
        process,
        qualityScore: Math.round(
          100 - (d.total / qualityIssues.length) * 100
        ),
        resolutionRate: d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 100,
      }))
      .sort((a, b) => b.qualityScore - a.qualityScore);

    // --- Pareto ---
    const sorted = [...issueByTypeData];
    const paretoTotal = sorted.reduce((s, i) => s + i.value, 0);
    let cum = 0;
    const paretoData = sorted.map((item) => {
      cum += item.value;
      return {
        name: item.name,
        count: item.value,
        cumPct: Math.round((cum / paretoTotal) * 100),
      };
    });

    // --- Factory Heatmap (process vs. month) ---
    const processes = [
      "Stamping",
      "Hot Stamping",
      "Welding",
      "Laser Trim",
      "Blanking",
    ];
    const months = factoryStats.monthlyData.map((m) => m.month);

    // build a deterministic but realistic heatmap from actual data patterns
    const heatmapData: { process: string; month: string; value: number }[] = [];
    const rng = (a: number, b: number) => ((a * 31 + b * 17) % 5);
    processes.forEach((proc, pi) => {
      months.forEach((month, mi) => {
        const monthIssues = factoryStats.monthlyData[mi].issues;
        const v = Math.max(
          0,
          Math.min(5, monthIssues + rng(pi, mi) - 2)
        );
        heatmapData.push({ process: proc, month, value: v });
      });
    });

    // --- Solution Catalog ---
    const solutionCatalog = (() => {
      const byType: Record<
        string,
        {
          count: number;
          rootCauses: string[];
          solutions: string[];
          resolved: number;
        }
      > = {};
      qualityIssues.forEach((q) => {
        if (!byType[q.issueType])
          byType[q.issueType] = {
            count: 0,
            rootCauses: [],
            solutions: [],
            resolved: 0,
          };
        byType[q.issueType].count += 1;
        byType[q.issueType].rootCauses.push(q.rootCause);
        byType[q.issueType].solutions.push(q.correctiveAction);
        if (q.status === "resolved") byType[q.issueType].resolved += 1;
      });
      return Object.entries(byType)
        .map(([type, d]) => ({
          type,
          count: d.count,
          topRootCause:
            d.rootCauses[0].length > 120
              ? d.rootCauses[0].slice(0, 120) + "..."
              : d.rootCauses[0],
          standardSolution:
            d.solutions[0].length > 120
              ? d.solutions[0].slice(0, 120) + "..."
              : d.solutions[0],
          effectiveness:
            d.count > 0 ? Math.round((d.resolved / d.count) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);
    })();

    // --- Department insights ---
    const departments = [
      {
        name: "Stamping",
        icon: Wrench,
        issues: qualityIssues.filter((q) =>
          q.process.toLowerCase().includes("stamping")
        ).length,
        openIssues: qualityIssues.filter(
          (q) =>
            q.process.toLowerCase().includes("stamping") &&
            q.status === "open"
        ).length,
        topIssue: "springback",
        avgRate: 2.8,
      },
      {
        name: "Hot Stamping",
        icon: Flame,
        issues: qualityIssues.filter((q) =>
          q.process.toLowerCase().includes("hot stamp")
        ).length,
        openIssues: qualityIssues.filter(
          (q) =>
            q.process.toLowerCase().includes("hot stamp") &&
            q.status === "open"
        ).length,
        topIssue: "thinning",
        avgRate: 1.5,
      },
      {
        name: "Welding",
        icon: Layers,
        issues: qualityIssues.filter((q) =>
          q.process.toLowerCase().includes("weld")
        ).length,
        openIssues: qualityIssues.filter(
          (q) =>
            q.process.toLowerCase().includes("weld") && q.status === "open"
        ).length,
        topIssue: "weld spatter",
        avgRate: 1.1,
      },
      {
        name: "Quality Lab",
        icon: FlaskConical,
        issues: 0,
        openIssues: 0,
        topIssue: "N/A",
        avgRate: 0.0,
      },
      {
        name: "Shipping",
        icon: Truck,
        issues: 0,
        openIssues: 0,
        topIssue: "N/A",
        avgRate: 0.0,
      },
    ];

    // --- Radar data for process capability ---
    const radarData = processPerformanceData.map((p) => ({
      subject: p.process,
      score: p.qualityScore,
      resolution: p.resolutionRate,
    }));

    return {
      totalProblems,
      solvedProblems,
      solvedPct,
      avgResolution,
      costOfQuality,
      topCategory,
      predictionAccuracy,
      issueByTypeData,
      issueBySeverityData,
      processPerformanceData,
      paretoData,
      heatmapData,
      processes,
      months,
      solutionCatalog,
      departments,
      radarData,
    };
  }, []);
}

// ---------------------------------------------------------------------------
// Custom dark tooltip
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-slate-800/95 backdrop-blur-sm px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-slate-100 mb-1">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: p.color || p.fill }}
          />
          {p.name}: <span className="font-medium text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Heatmap cell color
// ---------------------------------------------------------------------------

function heatColor(v: number): string {
  if (v === 0) return "bg-emerald-500/20 text-emerald-400";
  if (v === 1) return "bg-emerald-500/30 text-emerald-300";
  if (v === 2) return "bg-yellow-500/25 text-yellow-300";
  if (v === 3) return "bg-amber-500/30 text-amber-300";
  if (v === 4) return "bg-orange-500/35 text-orange-300";
  return "bg-red-500/40 text-red-300";
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const data = useAnalyticsData();
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null);

  const kpis = [
    {
      label: "Total Problems",
      value: data.totalProblems,
      icon: Tag,
      accent: "text-cyan-400",
      bg: "from-cyan-500/10 to-cyan-600/5",
    },
    {
      label: "Problems Solved",
      value: `${data.solvedProblems} (${data.solvedPct}%)`,
      icon: CheckCircle2,
      accent: "text-emerald-400",
      bg: "from-emerald-500/10 to-emerald-600/5",
    },
    {
      label: "Avg Resolution",
      value: `${data.avgResolution} days`,
      icon: Clock,
      accent: "text-amber-400",
      bg: "from-amber-500/10 to-amber-600/5",
    },
    {
      label: "Cost of Quality",
      value: `$${(data.costOfQuality / 1000).toFixed(0)}K`,
      icon: DollarSign,
      accent: "text-violet-400",
      bg: "from-violet-500/10 to-violet-600/5",
    },
    {
      label: "Top Category",
      value: data.topCategory,
      icon: TrendingUp,
      accent: "text-pink-400",
      bg: "from-pink-500/10 to-pink-600/5",
    },
    {
      label: "Prediction Accuracy",
      value: `${data.predictionAccuracy}%`,
      icon: Target,
      accent: "text-blue-400",
      bg: "from-blue-500/10 to-blue-600/5",
    },
  ];

  return (
    <div className="flex h-screen bg-[#0b0f1a] text-gray-100">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
          {/* ----------------------------------------------------------------
              Header
          ----------------------------------------------------------------- */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Analytics & Insights Dashboard
                </h1>
                <p className="text-sm text-gray-400">
                  Comprehensive quality data visualization
                </p>
              </div>
            </div>

            {/* Date range selector (mock) */}
            <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Apr 2025 &ndash; Mar 2026
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* ----------------------------------------------------------------
              1. KPI Row
          ----------------------------------------------------------------- */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.label}
                  className={`rounded-xl border border-white/[0.06] bg-gradient-to-br ${kpi.bg} backdrop-blur-sm p-4`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${kpi.accent}`} />
                    <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                      {kpi.label}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white truncate">
                    {kpi.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ----------------------------------------------------------------
              2. Quality Trends (full width ComposedChart)
          ----------------------------------------------------------------- */}
          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
            <h2 className="text-base font-semibold text-white mb-1">
              Quality Trends
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Monthly issues, resolutions, predictions & compliance rate
            </p>
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={factoryStats.monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[88, 96]}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip content={<DarkTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="compliance"
                  name="Compliance %"
                  fill="rgba(34,211,238,0.08)"
                  stroke="#22d3ee"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Bar
                  yAxisId="left"
                  dataKey="issues"
                  name="Issues"
                  fill="#a78bfa"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#34d399" }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="predicted"
                  name="Predicted"
                  stroke="#facc15"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{ r: 3, fill: "#facc15" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </section>

          {/* ----------------------------------------------------------------
              3. Issue Distribution (Pie + Severity Bar) side by side
          ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut - by type */}
            <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
              <h2 className="text-base font-semibold text-white mb-1">
                Issues by Type
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Distribution of defect categories
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.issueByTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label={({ name, percent }: any) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  >
                    {data.issueByTypeData.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={darkTooltipStyle.contentStyle}
                    itemStyle={darkTooltipStyle.itemStyle}
                    labelStyle={darkTooltipStyle.labelStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </section>

            {/* Severity bar */}
            <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
              <h2 className="text-base font-semibold text-white mb-1">
                Issues by Severity
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Critical / Major / Minor breakdown
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.issueBySeverityData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="severity"
                    type="category"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Count"
                    radius={[0, 6, 6, 0]}
                    barSize={32}
                  >
                    {data.issueBySeverityData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>

          {/* ----------------------------------------------------------------
              4. Process Performance (horizontal bar) + Radar side by side
          ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
              <h2 className="text-base font-semibold text-white mb-1">
                Process Performance
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Quality score & resolution rate by process area
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={data.processPerformanceData}
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <YAxis
                    dataKey="process"
                    type="category"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip content={<DarkTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
                  />
                  <Bar
                    dataKey="qualityScore"
                    name="Quality Score %"
                    fill="#22d3ee"
                    radius={[0, 4, 4, 0]}
                    barSize={14}
                  />
                  <Bar
                    dataKey="resolutionRate"
                    name="Resolution Rate %"
                    fill="#a78bfa"
                    radius={[0, 4, 4, 0]}
                    barSize={14}
                  />
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* Radar */}
            <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
              <h2 className="text-base font-semibold text-white mb-1">
                Process Capability Radar
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Multi-axis comparison across process areas
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  data={data.radarData}
                >
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={false}
                  />
                  <Radar
                    name="Quality Score"
                    dataKey="score"
                    stroke="#22d3ee"
                    fill="#22d3ee"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Resolution Rate"
                    dataKey="resolution"
                    stroke="#a78bfa"
                    fill="#a78bfa"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={darkTooltipStyle.contentStyle}
                    itemStyle={darkTooltipStyle.itemStyle}
                    labelStyle={darkTooltipStyle.labelStyle}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </section>
          </div>

          {/* ----------------------------------------------------------------
              5. Pareto Analysis (full width)
          ----------------------------------------------------------------- */}
          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
            <h2 className="text-base font-semibold text-white mb-1">
              Pareto Analysis
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Frequency by defect type with cumulative percentage overlay
            </p>
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={data.paretoData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: "Count",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#64748b", fontSize: 11 },
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                  label={{
                    value: "Cumulative %",
                    angle: 90,
                    position: "insideRight",
                    style: { fill: "#64748b", fontSize: 11 },
                  }}
                />
                <Tooltip content={<DarkTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  name="Frequency"
                  fill="#f472b6"
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumPct"
                  name="Cumulative %"
                  stroke="#facc15"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#facc15", stroke: "#0b0f1a", strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </section>

          {/* ----------------------------------------------------------------
              6. Factory Heatmap (process vs. month)
          ----------------------------------------------------------------- */}
          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
            <h2 className="text-base font-semibold text-white mb-1">
              Factory Issue Heatmap
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Issue intensity by process area and month (green = low, red =
              high)
            </p>
            <div className="overflow-x-auto">
              <div
                className="grid gap-px bg-white/[0.04] rounded-lg overflow-hidden"
                style={{
                  gridTemplateColumns: `140px repeat(${data.months.length}, minmax(70px, 1fr))`,
                }}
              >
                {/* Header row */}
                <div className="bg-slate-800/60 px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Process
                </div>
                {data.months.map((m) => (
                  <div
                    key={m}
                    className="bg-slate-800/60 px-2 py-2 text-center text-[10px] font-medium text-gray-400"
                  >
                    {m}
                  </div>
                ))}

                {/* Data rows */}
                {data.processes.map((proc) => (
                  <>
                    <div
                      key={`label-${proc}`}
                      className="bg-slate-800/30 px-3 py-2.5 text-xs font-medium text-gray-300 flex items-center"
                    >
                      {proc}
                    </div>
                    {data.months.map((month) => {
                      const cell = data.heatmapData.find(
                        (h) => h.process === proc && h.month === month
                      );
                      const v = cell?.value ?? 0;
                      return (
                        <div
                          key={`${proc}-${month}`}
                          className={`flex items-center justify-center py-2.5 text-xs font-bold ${heatColor(
                            v
                          )}`}
                        >
                          {v}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-[10px] text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500/30" /> 0-1 Low
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-yellow-500/30" /> 2 Moderate
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/35" /> 3 Elevated
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-500/40" /> 4-5 High
              </span>
            </div>
          </section>

          {/* ----------------------------------------------------------------
              7. Solution Catalog
          ----------------------------------------------------------------- */}
          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
            <h2 className="text-base font-semibold text-white mb-1">
              Solution Catalog
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Common problem types with root causes, standard solutions & effectiveness
            </p>
            <div className="space-y-2">
              {data.solutionCatalog.map((sol) => {
                const open = expandedSolution === sol.type;
                return (
                  <div
                    key={sol.type}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedSolution(open ? null : sol.type)
                      }
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-semibold text-white capitalize">
                          {sol.type}
                        </span>
                        <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-medium text-cyan-400">
                          {sol.count} occurrences
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            sol.effectiveness >= 75
                              ? "bg-emerald-500/10 text-emerald-400"
                              : sol.effectiveness >= 50
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {sol.effectiveness}% effective
                        </span>
                      </div>
                      {open ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {open && (
                      <div className="px-4 pb-4 pt-1 space-y-3 text-xs text-gray-300 border-t border-white/[0.04]">
                        <div>
                          <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">
                            Most Common Root Cause
                          </span>
                          <p className="mt-1">{sol.topRootCause}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">
                            Standard Solution
                          </span>
                          <p className="mt-1">{sol.standardSolution}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ----------------------------------------------------------------
              8. Department Insights
          ----------------------------------------------------------------- */}
          <section>
            <h2 className="text-base font-semibold text-white mb-1">
              Department Insights
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Per-area quality metrics overview
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {data.departments.map((dept) => {
                const Icon = dept.icon;
                return (
                  <div
                    key={dept.name}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10">
                        <Icon className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-sm font-semibold text-white">
                        {dept.name}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Issues</span>
                        <span className="font-semibold text-white">
                          {dept.issues}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Open</span>
                        <span
                          className={`font-semibold ${
                            dept.openIssues > 0
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {dept.openIssues}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Top Issue</span>
                        <span className="font-medium text-gray-200 capitalize">
                          {dept.topIssue}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Defect Rate</span>
                        <span className="font-medium text-gray-200">
                          {dept.avgRate}/1K
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>
      </main>
    </div>
  );
}
