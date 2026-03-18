"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import { qualityIssues, type QualityIssue } from "@/data/sampleData";
import {
  Plus,
  Filter,
  AlertTriangle,
  AlertCircle,
  Clock,
  CalendarDays,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  Zap,
  Activity,
  ArrowUpDown,
  Brain,
  CheckCircle2,
  Circle,
  Lightbulb,
  Target,
  Wrench,
  Flame,
  Droplets,
  Ruler,
  Sparkles,
  Disc,
  Waves,
  Crosshair,
  ScanLine,
  TriangleAlert,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

const issueTypeIcons: Record<string, React.ReactNode> = {
  crack: <Flame className="w-4 h-4 text-red-400" />,
  wrinkle: <Waves className="w-4 h-4 text-amber-400" />,
  springback: <Activity className="w-4 h-4 text-orange-400" />,
  "weld spatter": <Sparkles className="w-4 h-4 text-yellow-400" />,
  dimensional: <Ruler className="w-4 h-4 text-blue-400" />,
  "surface defect": <ScanLine className="w-4 h-4 text-purple-400" />,
  "hole misalignment": <Crosshair className="w-4 h-4 text-cyan-400" />,
  thinning: <Disc className="w-4 h-4 text-rose-400" />,
  "edge wave": <Droplets className="w-4 h-4 text-teal-400" />,
  "skid mark": <TriangleAlert className="w-4 h-4 text-slate-400" />,
};

function severityBadge(severity: QualityIssue["severity"]) {
  const map = {
    critical:
      "status-badge status-critical",
    major:
      "status-badge status-major",
    minor:
      "status-badge status-minor",
  };
  return <span className={map[severity]}>{severity}</span>;
}

function statusBadge(status: QualityIssue["status"]) {
  if (status === "open")
    return (
      <span className="status-badge status-critical">
        open
      </span>
    );
  if (status === "resolved")
    return (
      <span className="status-badge status-resolved">
        resolved
      </span>
    );
  return (
    <span className="status-badge status-major">
      monitoring
    </span>
  );
}

function daysBetween(a: string, b: string) {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  );
}

// Mock AI root cause prediction
function getAiPrediction(issue: QualityIssue) {
  const confidenceMap: Record<string, number> = {
    crack: 0.91,
    wrinkle: 0.87,
    springback: 0.84,
    "weld spatter": 0.79,
    dimensional: 0.88,
    "surface defect": 0.85,
    "hole misalignment": 0.92,
    thinning: 0.86,
    "edge wave": 0.77,
    "skid mark": 0.83,
  };
  const causes: Record<string, string[]> = {
    crack: [
      "Excessive thinning beyond forming limit diagram (FLD) boundary",
      "Material lot variation in elongation properties",
      "Die radius wear reducing material flow",
    ],
    wrinkle: [
      "Insufficient blank holder force in affected zone",
      "Incoming coil yield strength variation",
      "Draw bead height wear reducing restraint",
    ],
    springback: [
      "Material elastic modulus variation in incoming coil",
      "Insufficient overbend compensation in die design",
      "Temperature-dependent material response shift",
    ],
    "weld spatter": [
      "Electrode cap wear exceeding tip dress threshold",
      "Coating weight variation on incoming material",
      "Weld current schedule not optimized for material stack-up",
    ],
    dimensional: [
      "Progressive die wear on form/trim surfaces",
      "Thermal distortion from process heat cycling",
      "Fixture clamp drift affecting part location",
    ],
    "surface defect": [
      "Die face micro-pitting from material galling",
      "Contamination in lubrication system",
      "Transfer automation contact damage",
    ],
    "hole misalignment": [
      "Pilot pin wear exceeding positional tolerance",
      "Die deflection under tonnage load",
      "Part springback shifting hole datums",
    ],
    thinning: [
      "Localized strain concentration at geometry transition",
      "Blank size insufficient for material redistribution",
      "Lubrication breakdown in high-pressure zone",
    ],
    "edge wave": [
      "Residual stress in incoming coil from leveling process",
      "Material age-hardening during storage",
      "Blank holder pressure imbalance",
    ],
    "skid mark": [
      "Automation transfer contact pad degradation",
      "Excessive blank transfer speed",
      "Blank surface contamination from lube system",
    ],
  };
  return {
    confidence: confidenceMap[issue.issueType] ?? 0.8,
    suggestedCauses: causes[issue.issueType] ?? [
      "Insufficient process control",
      "Material variation",
      "Tool wear",
    ],
  };
}

function getRelatedIssues(current: QualityIssue) {
  return qualityIssues
    .filter(
      (q) =>
        q.id !== current.id &&
        (q.issueType === current.issueType ||
          q.process === current.process ||
          q.partId === current.partId)
    )
    .slice(0, 3);
}

function getTimeline(issue: QualityIssue) {
  const base = new Date(issue.dateReported);
  const steps = [
    {
      label: "Reported",
      date: issue.dateReported,
      done: true,
    },
    {
      label: "Investigation Started",
      date: new Date(base.getTime() + 2 * 86400000)
        .toISOString()
        .slice(0, 10),
      done: true,
    },
    {
      label: "Root Cause Identified",
      date: new Date(base.getTime() + 7 * 86400000)
        .toISOString()
        .slice(0, 10),
      done: issue.status !== "open",
    },
    {
      label: "Corrective Action Implemented",
      date: issue.dateResolved
        ? new Date(
            new Date(issue.dateResolved).getTime() - 3 * 86400000
          )
            .toISOString()
            .slice(0, 10)
        : null,
      done: issue.status === "resolved" || issue.status === "monitoring",
    },
    {
      label: "Resolved & Verified",
      date: issue.dateResolved,
      done: issue.status === "resolved",
    },
  ];
  return steps;
}

// -------------------------------------------------------------------
// Sort types
// -------------------------------------------------------------------

type SortKey =
  | "id"
  | "partName"
  | "issueType"
  | "severity"
  | "status"
  | "dateReported"
  | "affectedCount"
  | "occurrenceRate";

const severityOrder = { critical: 0, major: 1, minor: 2 };
const statusOrder = { open: 0, monitoring: 1, resolved: 2 };

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export default function QualityPage() {
  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [processFilter, setProcessFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>("dateReported");
  const [sortAsc, setSortAsc] = useState(false);

  // Detail panel
  const [selectedIssue, setSelectedIssue] = useState<QualityIssue | null>(
    null
  );

  // Unique processes for filter
  const processes = useMemo(
    () => Array.from(new Set(qualityIssues.map((q) => q.process))),
    []
  );

  // Filtered + sorted issues
  const filteredIssues = useMemo(() => {
    let list = [...qualityIssues];

    if (severityFilter !== "all")
      list = list.filter((q) => q.severity === severityFilter);
    if (statusFilter !== "all")
      list = list.filter((q) => q.status === statusFilter);
    if (processFilter !== "all")
      list = list.filter((q) => q.process === processFilter);
    if (dateFilter !== "all") {
      const now = new Date();
      if (dateFilter === "30d") {
        const cutoff = new Date(now.getTime() - 30 * 86400000);
        list = list.filter((q) => new Date(q.dateReported) >= cutoff);
      } else if (dateFilter === "90d") {
        const cutoff = new Date(now.getTime() - 90 * 86400000);
        list = list.filter((q) => new Date(q.dateReported) >= cutoff);
      } else if (dateFilter === "6m") {
        const cutoff = new Date(now.getTime() - 180 * 86400000);
        list = list.filter((q) => new Date(q.dateReported) >= cutoff);
      }
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(
        (q) =>
          q.id.toLowerCase().includes(s) ||
          q.partName.toLowerCase().includes(s) ||
          q.issueType.toLowerCase().includes(s) ||
          q.rootCause.toLowerCase().includes(s)
      );
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "id":
          cmp = a.id.localeCompare(b.id);
          break;
        case "partName":
          cmp = a.partName.localeCompare(b.partName);
          break;
        case "issueType":
          cmp = a.issueType.localeCompare(b.issueType);
          break;
        case "severity":
          cmp = severityOrder[a.severity] - severityOrder[b.severity];
          break;
        case "status":
          cmp = statusOrder[a.status] - statusOrder[b.status];
          break;
        case "dateReported":
          cmp =
            new Date(a.dateReported).getTime() -
            new Date(b.dateReported).getTime();
          break;
        case "affectedCount":
          cmp = a.affectedCount - b.affectedCount;
          break;
        case "occurrenceRate":
          cmp = a.occurrenceRate - b.occurrenceRate;
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [
    severityFilter,
    statusFilter,
    processFilter,
    dateFilter,
    searchTerm,
    sortKey,
    sortAsc,
  ]);

  // Stats
  const totalIssues = qualityIssues.length;
  const criticalOpen = qualityIssues.filter(
    (q) => q.severity === "critical" && q.status === "open"
  ).length;
  const resolvedIssues = qualityIssues.filter(
    (q) => q.dateResolved !== null
  );
  const avgResolution =
    resolvedIssues.length > 0
      ? Math.round(
          resolvedIssues.reduce(
            (sum, q) => sum + daysBetween(q.dateReported, q.dateResolved!),
            0
          ) / resolvedIssues.length
        )
      : 0;
  const thisMonth = qualityIssues.filter((q) => {
    const d = new Date(q.dateReported);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Chart data - issues by type
  const issuesByType = useMemo(() => {
    const counts: Record<string, number> = {};
    qualityIssues.forEach((q) => {
      counts[q.issueType] = (counts[q.issueType] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  // Chart data - by severity
  const issuesBySeverity = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, major: 0, minor: 0 };
    qualityIssues.forEach((q) => {
      counts[q.severity]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const pieColors = ["#ef4444", "#f59e0b", "#3b82f6"];

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function SortHeader({
    label,
    sortField,
  }: {
    label: string;
    sortField: SortKey;
  }) {
    const active = sortKey === sortField;
    return (
      <button
        onClick={() => handleSort(sortField)}
        className="inline-flex items-center gap-1 hover:text-white transition-colors"
      >
        {label}
        {active ? (
          sortAsc ? (
            <ChevronUp className="w-3 h-3 text-cyan-400" />
          ) : (
            <ChevronDown className="w-3 h-3 text-cyan-400" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-40" />
        )}
      </button>
    );
  }

  // ---------------------------------------------------------------
  // Detail Panel
  // ---------------------------------------------------------------

  function DetailPanel({ issue }: { issue: QualityIssue }) {
    const ai = getAiPrediction(issue);
    const related = getRelatedIssues(issue);
    const timeline = getTimeline(issue);

    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedIssue(null)}
        />

        {/* Panel */}
        <div className="relative w-full max-w-2xl h-full bg-[#0d1321] border-l border-white/10 overflow-y-auto animate-slide-up shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#0d1321]/95 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-cyan-400 font-mono font-semibold tracking-wider">
                {issue.id}
              </p>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {issue.partName} &mdash;{" "}
                <span className="capitalize">{issue.issueType}</span>
              </h2>
            </div>
            <button
              onClick={() => setSelectedIssue(null)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Quick info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card-static p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Severity
                </p>
                {severityBadge(issue.severity)}
              </div>
              <div className="glass-card-static p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Status
                </p>
                {statusBadge(issue.status)}
              </div>
              <div className="glass-card-static p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Process / Station
                </p>
                <p className="text-sm text-white">{issue.process}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {issue.station}
                </p>
              </div>
              <div className="glass-card-static p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Detection
                </p>
                <p className="text-sm text-white">
                  {issue.detectionMethod}
                </p>
              </div>
              <div className="glass-card-static p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Affected Parts
                </p>
                <p className="text-xl font-bold text-white">
                  {issue.affectedCount.toLocaleString()}
                </p>
              </div>
              <div className="glass-card-static p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Occurrence Rate
                </p>
                <p className="text-xl font-bold text-white">
                  {issue.occurrenceRate}{" "}
                  <span className="text-xs font-normal text-gray-500">
                    per 1,000
                  </span>
                </p>
              </div>
            </div>

            {/* Root Cause Analysis */}
            <div className="glass-card-static p-5 glow-border-danger">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Root Cause Analysis
                </h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {issue.rootCause}
              </p>
            </div>

            {/* Corrective Action */}
            <div className="glass-card-static p-5 glow-border-accent">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Corrective Action
                </h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {issue.correctiveAction}
              </p>
            </div>

            {/* AI Root Cause Prediction */}
            <div className="glass-card-accent p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  AI Root Cause Prediction
                </h3>
                <span className="ml-auto text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  ManuSigma AI
                </span>
              </div>

              {/* Confidence meter */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">
                    Prediction Confidence
                  </span>
                  <span className="text-sm font-bold text-cyan-400">
                    {(ai.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                    style={{ width: `${ai.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Suggested root causes */}
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                AI-Suggested Root Causes (ranked by likelihood)
              </p>
              <div className="space-y-2">
                {ai.suggestedCauses.map((cause, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5"
                  >
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 mt-0.5 ${
                        idx === 0
                          ? "bg-cyan-500/20 text-cyan-400"
                          : idx === 1
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-slate-500/20 text-slate-400"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <p className="text-sm text-gray-300">{cause}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>
                  Based on analysis of {qualityIssues.length} historical
                  issues and process patterns
                </span>
              </div>
            </div>

            {/* AI-Suggested Related Issues */}
            {related.length > 0 && (
              <div className="glass-card-static p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    AI-Suggested Related Issues
                  </h3>
                </div>
                <div className="space-y-2">
                  {related.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedIssue(r)}
                      className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors"
                    >
                      <span className="text-xs font-mono text-cyan-400">
                        {r.id}
                      </span>
                      <span className="text-sm text-gray-300 flex-1 truncate">
                        {r.partName} &mdash; {r.issueType}
                      </span>
                      {severityBadge(r.severity)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="glass-card-static p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Issue Timeline
                </h3>
              </div>
              <div className="relative pl-6 space-y-4">
                {/* Vertical line */}
                <div className="absolute left-[9px] top-1 bottom-1 w-px bg-white/10" />
                {timeline.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-3">
                    <div
                      className={`absolute left-[-15px] mt-1 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                        step.done
                          ? "border-emerald-500 bg-emerald-500/20"
                          : "border-gray-600 bg-gray-800"
                      }`}
                    >
                      {step.done ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Circle className="w-3 h-3 text-gray-600" />
                      )}
                    </div>
                    <div className="ml-2">
                      <p
                        className={`text-sm font-medium ${
                          step.done ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {step.date ?? "Pending"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#0a0f1a]">
        <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-6">
          {/* ============ Header ============ */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Quality Issue Tracker
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor, analyze, and resolve manufacturing quality issues
                across all production lines
              </p>
            </div>
            <button className="btn-primary inline-flex items-center gap-2 shrink-0 w-fit">
              <Plus className="w-4 h-4" />
              Create New Issue
            </button>
          </div>

          {/* ============ Filter Bar ============ */}
          <div className="glass-card-static p-4 flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500 shrink-0" />

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            </div>

            {/* Severity */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer min-w-[130px]"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer min-w-[130px]"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="monitoring">Monitoring</option>
            </select>

            {/* Process */}
            <select
              value={processFilter}
              onChange={(e) => setProcessFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="all">All Processes</option>
              {processes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Date Range */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer min-w-[130px]"
            >
              <option value="all">All Time</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="6m">Last 6 Months</option>
            </select>
          </div>

          {/* ============ Stats Bar ============ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {/* Total Issues */}
            <div className="glass-card-static metric-card metric-card-blue p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Total Issues
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {totalIssues}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Critical Open */}
            <div className="glass-card-static metric-card metric-card-red p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Critical Open
                  </p>
                  <p className="text-3xl font-bold text-red-400 mt-1">
                    {criticalOpen}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
              </div>
            </div>

            {/* Avg Resolution Time */}
            <div className="glass-card-static metric-card metric-card-amber p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Avg Resolution
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {avgResolution}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      days
                    </span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </div>

            {/* Issues This Month */}
            <div className="glass-card-static metric-card metric-card-green p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Issues This Month
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {thisMonth}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          {/* ============ Issues Table ============ */}
          <div className="glass-card-static overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Quality Issues ({filteredIssues.length})
              </h2>
              <p className="text-xs text-gray-500">
                Click any row to view details
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      <SortHeader label="Issue ID" sortField="id" />
                    </th>
                    <th>
                      <SortHeader label="Part Name" sortField="partName" />
                    </th>
                    <th>
                      <SortHeader
                        label="Issue Type"
                        sortField="issueType"
                      />
                    </th>
                    <th>
                      <SortHeader label="Severity" sortField="severity" />
                    </th>
                    <th>
                      <SortHeader label="Status" sortField="status" />
                    </th>
                    <th>
                      <SortHeader
                        label="Date Reported"
                        sortField="dateReported"
                      />
                    </th>
                    <th>Process / Station</th>
                    <th>
                      <SortHeader
                        label="Affected"
                        sortField="affectedCount"
                      />
                    </th>
                    <th>
                      <SortHeader
                        label="Rate (/1k)"
                        sortField="occurrenceRate"
                      />
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue) => (
                    <tr
                      key={issue.id}
                      className="cursor-pointer transition-colors hover:bg-cyan-500/[0.04]"
                      onClick={() => setSelectedIssue(issue)}
                    >
                      <td>
                        <span className="font-mono text-cyan-400 text-xs font-semibold">
                          {issue.id}
                        </span>
                      </td>
                      <td className="font-medium text-white">
                        {issue.partName}
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 capitalize">
                          {issueTypeIcons[issue.issueType]}
                          {issue.issueType}
                        </span>
                      </td>
                      <td>{severityBadge(issue.severity)}</td>
                      <td>{statusBadge(issue.status)}</td>
                      <td className="text-gray-400 text-xs">
                        {issue.dateReported}
                      </td>
                      <td>
                        <div>
                          <p className="text-xs text-gray-300 truncate max-w-[200px]">
                            {issue.process}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate max-w-[200px]">
                            {issue.station}
                          </p>
                        </div>
                      </td>
                      <td className="font-medium">
                        {issue.affectedCount.toLocaleString()}
                      </td>
                      <td>
                        <span className="text-sm">{issue.occurrenceRate}</span>
                      </td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIssue(issue);
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-cyan-400 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredIssues.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center py-12 text-gray-500"
                      >
                        No issues match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============ Charts ============ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart - Issues by Type */}
            <div className="lg:col-span-2 chart-container">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Issues by Type
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={issuesByType}
                  margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1e293b",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#f1f5f9",
                      fontSize: "13px",
                    }}
                    cursor={{ fill: "rgba(59,130,246,0.06)" }}
                  />
                  <Bar
                    dataKey="value"
                    name="Issues"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart - By Severity */}
            <div className="chart-container flex flex-col">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Issues by Severity
              </h3>
              <div className="flex-1 min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={issuesBySeverity}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {issuesBySeverity.map((_, idx) => (
                        <Cell key={idx} fill={pieColors[idx]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        color: "#f1f5f9",
                        fontSize: "13px",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span className="text-xs text-gray-400 capitalize">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ============ Detail Slide-Over Panel ============ */}
      {selectedIssue && <DetailPanel issue={selectedIssue} />}
    </div>
  );
}
