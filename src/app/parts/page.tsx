"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import {
  parts,
  qualityIssues,
  pfmeaData,
  controlPlans,
  type Part,
} from "@/data/sampleData";
import {
  Search,
  Filter,
  Package,
  Activity,
  BarChart3,
  Layers,
  X,
  ChevronRight,
  AlertTriangle,
  Shield,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Truck,
  Cog,
  Wrench,
  ClipboardCheck,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getIssueCountForPart(partId: string) {
  return qualityIssues.filter((q) => q.partId === partId).length;
}

function getOpenIssueCountForPart(partId: string) {
  return qualityIssues.filter((q) => q.partId === partId && q.status === "open")
    .length;
}

function getPfmeaCountForPart(partId: string) {
  return pfmeaData.filter((p) => p.partId === partId).length;
}

function getComplianceForPart(partId: string) {
  const plans = controlPlans.filter((c) => c.partId === partId);
  if (plans.length === 0) return 100;
  const compliant = plans.filter((c) => c.isCompliant).length;
  return Math.round((compliant / plans.length) * 100);
}

function getQualityScore(partId: string) {
  const issues = qualityIssues.filter((q) => q.partId === partId);
  const totalIssues = issues.length;
  const openIssues = issues.filter((i) => i.status === "open").length;
  const criticalIssues = issues.filter((i) => i.severity === "critical").length;
  let score = 100;
  score -= totalIssues * 3;
  score -= openIssues * 8;
  score -= criticalIssues * 10;
  return Math.max(0, Math.min(100, score));
}

function getQualityTrend(partId: string): "up" | "down" | "stable" {
  const issues = qualityIssues.filter((q) => q.partId === partId);
  const openCount = issues.filter((i) => i.status === "open").length;
  const resolvedCount = issues.filter((i) => i.status === "resolved").length;
  if (openCount === 0 && resolvedCount > 0) return "up";
  if (openCount >= 2) return "down";
  return "stable";
}

const statusConfig: Record<
  string,
  { label: string; color: string; dotColor: string }
> = {
  active: {
    label: "Active",
    color: "text-emerald-400",
    dotColor: "bg-emerald-400",
  },
  "engineering-change": {
    label: "Under Review",
    color: "text-amber-400",
    dotColor: "bg-amber-400",
  },
  "pre-production": {
    label: "New",
    color: "text-blue-400",
    dotColor: "bg-blue-400",
  },
  discontinued: {
    label: "Discontinued",
    color: "text-gray-400",
    dotColor: "bg-gray-500",
  },
};

const materialColors: Record<string, string> = {
  Aluminum: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  Steel: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Boron: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

function getMaterialChipStyle(material: string) {
  if (material.toLowerCase().includes("aluminum"))
    return materialColors.Aluminum;
  if (material.toLowerCase().includes("boron")) return materialColors.Boron;
  return materialColors.Steel;
}

function getValueStreamStepColor(step: string) {
  const s = step.toLowerCase();
  if (
    s.includes("coil") ||
    s.includes("receipt") ||
    s.includes("blank receipt")
  )
    return "from-teal-500 to-teal-600";
  if (s.includes("ship") || s.includes("convey") || s.includes("rack"))
    return "from-emerald-500 to-emerald-600";
  if (
    s.includes("cmm") ||
    s.includes("audit") ||
    s.includes("inspection") ||
    s.includes("check") ||
    s.includes("hardness") ||
    s.includes("microstructure")
  )
    return "from-green-500 to-green-600";
  if (s.includes("weld") || s.includes("assembly") || s.includes("hem"))
    return "from-purple-500 to-purple-600";
  return "from-blue-500 to-blue-600";
}

function getValueStreamStepIcon(step: string) {
  const s = step.toLowerCase();
  if (
    s.includes("coil") ||
    s.includes("receipt") ||
    s.includes("blank receipt")
  )
    return Truck;
  if (s.includes("ship") || s.includes("convey") || s.includes("rack"))
    return Truck;
  if (
    s.includes("cmm") ||
    s.includes("audit") ||
    s.includes("inspection") ||
    s.includes("check") ||
    s.includes("hardness")
  )
    return ClipboardCheck;
  if (s.includes("weld") || s.includes("assembly") || s.includes("hem"))
    return Wrench;
  return Cog;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PartsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [processFilter, setProcessFilter] = useState<string>("all");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  // Unique filter values
  const processes = useMemo(
    () => Array.from(new Set(parts.map((p) => p.process))),
    []
  );
  const vehicles = useMemo(
    () => Array.from(new Set(parts.map((p) => p.vehicle))),
    []
  );
  const statuses = useMemo(
    () => Array.from(new Set(parts.map((p) => p.status))),
    []
  );

  // Filtered parts
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchesSearch =
        searchQuery === "" ||
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.material.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProcess =
        processFilter === "all" || part.process === processFilter;
      const matchesVehicle =
        vehicleFilter === "all" || part.vehicle === vehicleFilter;
      const matchesStatus =
        statusFilter === "all" || part.status === statusFilter;
      return matchesSearch && matchesProcess && matchesVehicle && matchesStatus;
    });
  }, [searchQuery, processFilter, vehicleFilter, statusFilter]);

  // Summary stats
  const totalParts = filteredParts.length;
  const avgVolume = Math.round(
    filteredParts.reduce((sum, p) => sum + p.annualVolume, 0) /
      (filteredParts.length || 1)
  );
  const processCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredParts.forEach((p) => {
      counts[p.process] = (counts[p.process] || 0) + 1;
    });
    return counts;
  }, [filteredParts]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 space-y-6">
          {/* ---------------------------------------------------------------- */}
          {/* Summary Stats Bar                                                */}
          {/* ---------------------------------------------------------------- */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-500/10">
                  <Package className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    Total Parts
                  </p>
                  <p className="text-2xl font-bold text-white">{totalParts}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    Avg Annual Volume
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {avgVolume.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-4 lg:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-xs text-gray-400 font-medium">
                  Parts by Process
                </p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                {Object.entries(processCounts).map(([process, count]) => (
                  <div key={process} className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white capitalize">
                      {process}
                    </span>
                    <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full bg-white/10 text-xs font-bold text-white">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Header                                                           */}
          {/* ---------------------------------------------------------------- */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Parts Database
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Body-in-White Sheet Metal Components
              </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search parts by name, number, or material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              {/* Filter dropdowns */}
              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <select
                    value={processFilter}
                    onChange={(e) => setProcessFilter(e.target.value)}
                    className="h-10 pl-9 pr-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
                  >
                    <option value="all">All Processes</option>
                    {processes.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <select
                    value={vehicleFilter}
                    onChange={(e) => setVehicleFilter(e.target.value)}
                    className="h-10 pl-9 pr-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
                  >
                    <option value="all">All Vehicles</option>
                    {vehicles.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 pl-9 pr-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {statusConfig[s]?.label ?? s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Parts Grid                                                       */}
          {/* ---------------------------------------------------------------- */}
          {filteredParts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Package className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-lg font-medium">No parts found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredParts.map((part) => {
                const status = statusConfig[part.status];
                const qualityScore = getQualityScore(part.id);
                const trend = getQualityTrend(part.id);
                const issueCount = getIssueCountForPart(part.id);
                const openIssues = getOpenIssueCountForPart(part.id);

                return (
                  <button
                    key={part.id}
                    onClick={() => setSelectedPart(part)}
                    className="group text-left rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 cursor-pointer"
                  >
                    {/* Part number badge + status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-mono font-semibold tracking-wide">
                        {part.partNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${status.dotColor} shadow-sm`}
                          style={{
                            boxShadow:
                              part.status === "active"
                                ? "0 0 6px rgba(52,211,153,0.5)"
                                : part.status === "engineering-change"
                                  ? "0 0 6px rgba(251,191,36,0.5)"
                                  : part.status === "pre-production"
                                    ? "0 0 6px rgba(96,165,250,0.5)"
                                    : "none",
                          }}
                        />
                        <span
                          className={`text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Part name */}
                    <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-cyan-50 transition-colors">
                      {part.name}
                    </h3>

                    {/* Material chip */}
                    <div className="mb-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getMaterialChipStyle(part.material)}`}
                      >
                        {part.material}
                      </span>
                    </div>

                    {/* Info rows */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Process</span>
                        <span className="text-gray-300 capitalize font-medium">
                          {part.process}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Vehicle</span>
                        <span className="text-gray-300 font-medium">
                          {part.vehicle}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Annual Volume</span>
                        <span className="text-gray-300 font-medium">
                          {part.annualVolume.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Quality score + issues */}
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                            qualityScore >= 80
                              ? "bg-emerald-500/10 text-emerald-400"
                              : qualityScore >= 60
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {trend === "up" && (
                            <TrendingUp className="w-3 h-3" />
                          )}
                          {trend === "down" && (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {trend === "stable" && (
                            <Minus className="w-3 h-3" />
                          )}
                          {qualityScore}%
                        </div>
                        <span className="text-[11px] text-gray-500">
                          Quality
                        </span>
                      </div>
                      {issueCount > 0 && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <AlertTriangle
                            className={`w-3.5 h-3.5 ${openIssues > 0 ? "text-amber-400" : "text-gray-500"}`}
                          />
                          <span className="text-gray-400">
                            {issueCount} issue{issueCount !== 1 ? "s" : ""}
                            {openIssues > 0 && (
                              <span className="text-amber-400 ml-1">
                                ({openIssues} open)
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Part Detail Modal                                                   */}
      {/* ------------------------------------------------------------------ */}
      {selectedPart && (
        <PartDetailModal
          part={selectedPart}
          onClose={() => setSelectedPart(null)}
        />
      )}
    </div>
  );
}

// ===========================================================================
// Part Detail Modal
// ===========================================================================

function PartDetailModal({
  part,
  onClose,
}: {
  part: Part;
  onClose: () => void;
}) {
  const issueCount = getIssueCountForPart(part.id);
  const openIssues = getOpenIssueCountForPart(part.id);
  const pfmeaCount = getPfmeaCountForPart(part.id);
  const complianceRate = getComplianceForPart(part.id);
  const qualityScore = getQualityScore(part.id);
  const trend = getQualityTrend(part.id);
  const status = statusConfig[part.status];

  const partIssues = qualityIssues.filter((q) => q.partId === part.id);
  const severityCounts = {
    critical: partIssues.filter((i) => i.severity === "critical").length,
    major: partIssues.filter((i) => i.severity === "major").length,
    minor: partIssues.filter((i) => i.severity === "minor").length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 my-8 rounded-2xl border border-white/[0.08] bg-[#0d1321]/95 backdrop-blur-xl shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 lg:p-8 space-y-6">
          {/* Modal Header */}
          <div className="pr-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-cyan-500/10 text-cyan-400 text-sm font-mono font-semibold tracking-wide">
                {part.partNumber}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${status.dotColor}`}
                  style={{
                    boxShadow:
                      part.status === "active"
                        ? "0 0 6px rgba(52,211,153,0.5)"
                        : part.status === "engineering-change"
                          ? "0 0 6px rgba(251,191,36,0.5)"
                          : part.status === "pre-production"
                            ? "0 0 6px rgba(96,165,250,0.5)"
                            : "none",
                  }}
                />
                <span className={`text-sm font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">{part.name}</h2>
          </div>

          {/* Part Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoCell label="Material" value={part.material} />
            <InfoCell label="Thickness" value={`${part.thickness} mm`} />
            <InfoCell label="Process" value={part.process} capitalize />
            <InfoCell label="Supplier" value={part.supplier} />
            <InfoCell label="Vehicle" value={part.vehicle} />
            <InfoCell
              label="Annual Volume"
              value={part.annualVolume.toLocaleString()}
            />
            <InfoCell
              label="Value Stream Steps"
              value={`${part.valueStream.length} steps`}
            />
            <InfoCell label="Part ID" value={part.id} />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Quality Score */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-xs text-gray-400 font-medium mb-1">
                Quality Score
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-2xl font-bold ${
                    qualityScore >= 80
                      ? "text-emerald-400"
                      : qualityScore >= 60
                        ? "text-amber-400"
                        : "text-red-400"
                  }`}
                >
                  {qualityScore}%
                </span>
                {trend === "up" && (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                )}
                {trend === "down" && (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                {trend === "stable" && (
                  <Minus className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {trend === "up"
                  ? "Improving"
                  : trend === "down"
                    ? "Needs attention"
                    : "Stable"}
              </p>
            </div>

            {/* Quality Issues */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-xs text-gray-400 font-medium mb-1">
                Quality Issues
              </p>
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`w-5 h-5 ${openIssues > 0 ? "text-amber-400" : "text-gray-500"}`}
                />
                <span className="text-2xl font-bold text-white">
                  {issueCount}
                </span>
              </div>
              {openIssues > 0 && (
                <p className="text-[11px] text-amber-400 mt-1">
                  {openIssues} open
                </p>
              )}
              {openIssues === 0 && issueCount > 0 && (
                <p className="text-[11px] text-emerald-400 mt-1">
                  All resolved
                </p>
              )}
            </div>

            {/* PFMEA */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-xs text-gray-400 font-medium mb-1">
                PFMEA Entries
              </p>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <span className="text-2xl font-bold text-white">
                  {pfmeaCount}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Failure mode analyses
              </p>
            </div>

            {/* Compliance */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-xs text-gray-400 font-medium mb-1">
                Compliance
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-5 h-5 ${complianceRate >= 90 ? "text-emerald-400" : complianceRate >= 70 ? "text-amber-400" : "text-red-400"}`}
                />
                <span
                  className={`text-2xl font-bold ${complianceRate >= 90 ? "text-emerald-400" : complianceRate >= 70 ? "text-amber-400" : "text-red-400"}`}
                >
                  {complianceRate}%
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Control plan compliance
              </p>
            </div>
          </div>

          {/* Issue Severity Breakdown */}
          {issueCount > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-xs text-gray-400 font-medium mb-3">
                Issue Severity Breakdown
              </p>
              <div className="flex items-center gap-6">
                {severityCounts.critical > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                    <span className="text-sm text-gray-300">
                      <span className="font-semibold text-white">
                        {severityCounts.critical}
                      </span>{" "}
                      Critical
                    </span>
                  </div>
                )}
                {severityCounts.major > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                    <span className="text-sm text-gray-300">
                      <span className="font-semibold text-white">
                        {severityCounts.major}
                      </span>{" "}
                      Major
                    </span>
                  </div>
                )}
                {severityCounts.minor > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                    <span className="text-sm text-gray-300">
                      <span className="font-semibold text-white">
                        {severityCounts.minor}
                      </span>{" "}
                      Minor
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* Value Stream Map                                              */}
          {/* ------------------------------------------------------------ */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-cyan-400" />
              Value Stream Map
            </h3>

            <div className="overflow-x-auto pb-2">
              <div className="flex items-center gap-1 min-w-max">
                {part.valueStream.map((step, idx) => {
                  const StepIcon = getValueStreamStepIcon(step);
                  return (
                    <div key={idx} className="flex items-center">
                      {/* Step node */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`relative flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-br ${getValueStreamStepColor(step)} text-white shadow-lg min-w-[140px] max-w-[180px]`}
                        >
                          <StepIcon className="w-4 h-4 shrink-0 opacity-80" />
                          <span className="text-[11px] font-medium leading-tight">
                            {step}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1">
                          Step {idx + 1}
                        </span>
                      </div>

                      {/* Arrow between steps */}
                      {idx < part.valueStream.length - 1 && (
                        <div className="flex items-center mx-1 -mt-4">
                          <ArrowRight className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Value stream legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.05] flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-br from-teal-500 to-teal-600" />
                <span className="text-[11px] text-gray-400">
                  Material Handling
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-br from-blue-500 to-blue-600" />
                <span className="text-[11px] text-gray-400">Processing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-br from-purple-500 to-purple-600" />
                <span className="text-[11px] text-gray-400">
                  Assembly / Welding
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-br from-green-500 to-green-600" />
                <span className="text-[11px] text-gray-400">
                  QC / Shipping
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-br from-emerald-500 to-emerald-600" />
                <span className="text-[11px] text-gray-400">Logistics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Small helper components
// ===========================================================================

function InfoCell({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] px-3 py-2.5">
      <p className="text-[11px] text-gray-500 font-medium mb-0.5">{label}</p>
      <p
        className={`text-sm text-white font-medium truncate ${capitalize ? "capitalize" : ""}`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
