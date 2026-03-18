"use client";

import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import {
  Package,
  AlertTriangle,
  Shield,
  TrendingUp,
  Bell,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  GitBranch,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

const QualityTrendsChart = dynamic(
  () => import("@/components/DashboardCharts").then((m) => m.QualityTrendsChart),
  { ssr: false }
);
const CompliancePieChart = dynamic(
  () => import("@/components/DashboardCharts").then((m) => m.CompliancePieChart),
  { ssr: false }
);
import {
  factoryStats,
  predictions,
  qualityIssues,
  controlPlans,
  horizontalDeployments,
} from "@/data/sampleData";

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------
function KPICard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  accentColor,
  metricClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  accentColor: string;
  metricClass: string;
}) {
  return (
    <div className={`glass-card metric-card ${metricClass} p-5`}>
      <div className="flex items-start justify-between">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-lg ${accentColor}`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${
            trendUp ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {trendUp ? (
            <ArrowUpRight className="w-3.5 h-3.5" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5" />
          )}
          {trend}
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-400">{label}</p>
    </div>
  );
}


// ---------------------------------------------------------------------------
// Severity & Status Badge helpers
// ---------------------------------------------------------------------------
function severityBadgeClass(severity: string) {
  switch (severity) {
    case "critical":
      return "status-badge status-critical";
    case "major":
      return "status-badge status-major";
    case "minor":
      return "status-badge status-minor";
    default:
      return "status-badge";
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "open":
      return "status-badge status-critical";
    case "monitoring":
      return "status-badge status-major";
    case "resolved":
      return "status-badge status-resolved";
    default:
      return "status-badge";
  }
}

// ---------------------------------------------------------------------------
// Horizontal Deployment status helpers
// ---------------------------------------------------------------------------
function hdStatusColor(status: string) {
  switch (status) {
    case "completed":
    case "verified":
      return "text-emerald-400";
    case "in-progress":
      return "text-blue-400";
    case "planned":
      return "text-amber-400";
    default:
      return "text-slate-400";
  }
}

function hdBarColor(status: string) {
  switch (status) {
    case "completed":
    case "verified":
      return "bg-emerald-500";
    case "in-progress":
      return "bg-blue-500";
    case "planned":
      return "bg-amber-500";
    default:
      return "bg-slate-500";
  }
}

function hdStatusIcon(status: string) {
  switch (status) {
    case "completed":
    case "verified":
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    case "in-progress":
      return <Clock className="w-3.5 h-3.5 text-blue-400" />;
    case "planned":
      return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  // -- Derived data --
  const sortedPredictions = [...predictions]
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5);

  const recentIssues = [...qualityIssues]
    .sort(
      (a, b) =>
        new Date(b.dateReported).getTime() -
        new Date(a.dateReported).getTime()
    )
    .slice(0, 8);

  const compliantCount = controlPlans.filter((cp) => cp.isCompliant).length;
  const nonCompliantCount = controlPlans.filter((cp) => !cp.isCompliant).length;
  const needsReview = controlPlans.length - compliantCount - nonCompliantCount;

  const compliancePieData = [
    { name: "Compliant", value: compliantCount, color: "#10b981" },
    { name: "Non-Compliant", value: nonCompliantCount, color: "#ef4444" },
    ...(needsReview > 0
      ? [{ name: "Needs Review", value: needsReview, color: "#f59e0b" }]
      : []),
  ];

  const activeDeployments = horizontalDeployments.filter(
    (hd) => hd.status !== "verified"
  );

  const openIssueCount = qualityIssues.filter(
    (qi) => qi.status === "open"
  ).length;

  // -- Render --
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* ================================================================
            Header
            ================================================================ */}
        <header className="sticky top-0 z-30 gradient-header-blue border-b border-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Manufacturing Command Center
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5 text-slate-300" />
              {openIssueCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                  {openIssueCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* ================================================================
              KPI Cards
              ================================================================ */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            <KPICard
              icon={Package}
              label="Total Active Parts"
              value={factoryStats.totalParts}
              trend="+2 this quarter"
              trendUp
              accentColor="bg-gradient-to-br from-blue-500 to-blue-700"
              metricClass="metric-card-blue"
            />
            <KPICard
              icon={AlertTriangle}
              label="Open Quality Issues"
              value={factoryStats.openIssues}
              trend="-3 vs last month"
              trendUp={false}
              accentColor="bg-gradient-to-br from-red-500 to-red-700"
              metricClass="metric-card-red"
            />
            <KPICard
              icon={Shield}
              label="Compliance Rate"
              value={`${factoryStats.complianceRate}%`}
              trend="+1.2% this quarter"
              trendUp
              accentColor="bg-gradient-to-br from-emerald-500 to-emerald-700"
              metricClass="metric-card-green"
            />
            <KPICard
              icon={TrendingUp}
              label="Prediction Accuracy"
              value={`${factoryStats.predictionAccuracy}%`}
              trend="+4.3% improved"
              trendUp
              accentColor="bg-gradient-to-br from-cyan-500 to-blue-600"
              metricClass="metric-card-blue"
            />
          </section>

          {/* ================================================================
              Quality Trends Chart + AI Predictions
              ================================================================ */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* --- Quality Trends Chart (2/3 width) --- */}
            <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-slate-900/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Quality Trends
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Issues, resolutions &amp; AI predictions over 12 months
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-slate-400">Issues</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-400">Resolved</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="text-slate-400">Predicted</span>
                  </span>
                </div>
              </div>

              <QualityTrendsChart />
            </div>

            {/* --- AI Predictions Alert Panel (1/3 width) --- */}
            <div className="glass-card-accent p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    AI Predictions
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    Top failure risks by probability
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar">
                {sortedPredictions.map((pred) => {
                  const probPct = Math.round(pred.probability * 100);
                  const barColor =
                    pred.probability > 0.7
                      ? "bg-red-500"
                      : pred.probability > 0.5
                      ? "bg-amber-500"
                      : "bg-emerald-500";
                  const textColor =
                    pred.probability > 0.7
                      ? "text-red-400"
                      : pred.probability > 0.5
                      ? "text-amber-400"
                      : "text-emerald-400";

                  return (
                    <div
                      key={pred.id}
                      className="p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-xs font-medium text-white leading-snug line-clamp-2">
                          {pred.failureMode}
                        </p>
                        <span
                          className={`text-xs font-bold whitespace-nowrap ${textColor}`}
                        >
                          {probPct}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">
                        {pred.partName} &middot; {pred.timeframe}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor} transition-all`}
                            style={{ width: `${probPct}%` }}
                          />
                        </div>
                        <button className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ================================================================
              Recent Quality Issues Table
              ================================================================ */}
          <section className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-sm font-semibold text-white">
                Recent Quality Issues
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Last 8 reported issues across all production lines
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Issue ID</th>
                    <th>Part</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Process</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td className="font-mono text-xs text-cyan-400">
                        {issue.id}
                      </td>
                      <td className="text-sm text-white">{issue.partName}</td>
                      <td className="text-sm text-slate-300 capitalize">
                        {issue.issueType}
                      </td>
                      <td>
                        <span className={severityBadgeClass(issue.severity)}>
                          {issue.severity}
                        </span>
                      </td>
                      <td>
                        <span className={statusBadgeClass(issue.status)}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="text-sm text-slate-400 whitespace-nowrap">
                        {issue.dateReported}
                      </td>
                      <td className="text-xs text-slate-500 max-w-[200px] truncate">
                        {issue.process}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ================================================================
              Compliance Overview + Horizontal Deployments
              ================================================================ */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* --- Compliance Donut Chart --- */}
            <div className="chart-container flex flex-col items-center">
              <div className="w-full mb-4">
                <h2 className="text-sm font-semibold text-white">
                  Compliance Overview
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Control plan compliance status
                </p>
              </div>

              <CompliancePieChart />

              {/* Legend */}
              <div className="flex items-center gap-4 mt-2">
                {compliancePieData.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-1.5 text-[11px]"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: entry.color }}
                    />
                    <span className="text-slate-400">{entry.name}</span>
                    <span className="font-semibold text-white">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* --- Active Horizontal Deployments (2/3 width) --- */}
            <div className="lg:col-span-2 glass-card p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                  <GitBranch className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Active Horizontal Deployments
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    Cross-part corrective action rollouts
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeDeployments.map((hd) => (
                  <div
                    key={hd.id}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-cyan-400">
                        {hd.id}
                      </span>
                      <span className="flex items-center gap-1">
                        {hdStatusIcon(hd.status)}
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider ${hdStatusColor(
                            hd.status
                          )}`}
                        >
                          {hd.status}
                        </span>
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white mb-1">
                      {hd.sourcePartName}
                    </p>
                    <p className="text-[10px] text-slate-500 mb-3 line-clamp-1">
                      {hd.commonProcess}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${hdBarColor(
                            hd.status
                          )} transition-all duration-500`}
                          style={{ width: `${hd.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white min-w-[36px] text-right">
                        {hd.completionPercentage}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">
                      {hd.affectedParts.length} affected part
                      {hd.affectedParts.length !== 1 ? "s" : ""} &middot;{" "}
                      {hd.standardsToUpdate.length} standards
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
