"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { factoryStats, controlPlans } from "@/data/sampleData";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-slate-800/95 backdrop-blur-sm p-3 text-xs">
      <p className="font-semibold text-white mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-slate-400 capitalize">{entry.name}:</span>
          <span className="font-medium text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function QualityTrendsChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={factoryStats.monthlyData}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
        />
        <XAxis
          dataKey="month"
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ stroke: "rgba(255,255,255,0.08)" }}
        />
        <Area
          type="monotone"
          dataKey="issues"
          stroke="#ef4444"
          strokeWidth={2.5}
          fill="rgba(239,68,68,0.15)"
          dot={false}
          activeDot={{ r: 4, fill: "#ef4444", stroke: "#0a0f1a", strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="resolved"
          stroke="#10b981"
          strokeWidth={2.5}
          fill="rgba(16,185,129,0.15)"
          dot={false}
          activeDot={{ r: 4, fill: "#10b981", stroke: "#0a0f1a", strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="predicted"
          stroke="#22d3ee"
          strokeWidth={2.5}
          fill="rgba(34,211,238,0.15)"
          dot={false}
          activeDot={{ r: 4, fill: "#22d3ee", stroke: "#0a0f1a", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CompliancePieChart() {
  const compliantCount = controlPlans.filter((cp) => cp.isCompliant).length;
  const nonCompliantCount = controlPlans.filter((cp) => !cp.isCompliant).length;
  const compliancePieData = [
    { name: "Compliant", value: compliantCount, color: "#10b981" },
    { name: "Non-Compliant", value: nonCompliantCount, color: "#ef4444" },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={compliancePieData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
          stroke="none"
        >
          {compliancePieData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || !payload[0]) return null;
            const data = payload[0].payload as {
              name: string;
              value: number;
              color: string;
            };
            return (
              <div className="rounded-lg border border-white/10 bg-slate-800/95 backdrop-blur-sm p-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: data.color }}
                  />
                  <span className="text-white font-medium">{data.name}</span>
                </div>
                <p className="text-slate-400 mt-1">
                  {data.value} control plan{data.value !== 1 ? "s" : ""}
                </p>
              </div>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
