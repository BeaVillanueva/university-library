import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../state/AuthContext";
import {
  apiReportsSummary,
  apiReportsMySummary,
  apiReportsDistribution,
  apiReportsWeeklyBorrows,
  apiReportsMyWeeklyBorrows,
  apiReportsStudentStats
} from "../api/reports";
import Alert from "../components/Alert";

import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";

let chartRegistered = false;
function ensureChartRegistered() {
  if (chartRegistered) return;
  ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);
  chartRegistered = true;
}

export default function DashboardPage() {
  ensureChartRegistered();

  const { user } = useAuth();

  const [kpis, setKpis] = useState(null);
  const [dist, setDist] = useState(null);
  const [trend, setTrend] = useState(null);
  const [studentStats, setStudentStats] = useState(null);

  const [error, setError] = useState("");

  const role = user?.role || "";
  const isStudent = useMemo(() => role === "student", [role]);
  const canSeeGlobalStats = !isStudent; // admin/librarian

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError("");
      try {
        const kpiPromise = isStudent ? apiReportsMySummary() : apiReportsSummary();
        const distPromise = isStudent ? Promise.resolve(null) : apiReportsDistribution();
        const trendPromise = isStudent ? apiReportsMyWeeklyBorrows() : apiReportsWeeklyBorrows();
        const studentStatsPromise = canSeeGlobalStats ? apiReportsStudentStats() : Promise.resolve(null);

        const [kpiRes, distRes, trendRes, ssRes] = await Promise.all([
          kpiPromise,
          distPromise,
          trendPromise,
          studentStatsPromise
        ]);

        if (cancelled) return;

        setKpis(kpiRes?.kpis || null);
        setDist(distRes?.distribution || null);
        setTrend(trendRes?.trend || null);
        setStudentStats(ssRes || null);
      } catch (e) {
        if (!cancelled) {
          setKpis(null);
          setDist(null);
          setTrend(null);
          setStudentStats(null);
          setError(e?.response?.data?.error || e?.message || "Failed to load dashboard");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isStudent, canSeeGlobalStats]);

    // KPI cards
  const cards = isStudent
    ? [
        { title: "Total borrowed", value: kpis?.my_total_borrowed ?? "—", tone: "bg-sky-50" },
        { title: "Borrowed (active)", value: kpis?.my_borrowed_active ?? "—", tone: "bg-emerald-50" },
        { title: "Overdue (active)", value: kpis?.my_overdue_active ?? "—", tone: "bg-rose-50" },
        { title: "Returned (total)", value: kpis?.my_returned_total ?? "—", tone: "bg-amber-50" }
      ]
    : [
        // ✅ TOTAL STUDENTS FIRST
        {
          title: "Total students",
          value: studentStats?.total_students_approved ?? "—",
          tone: "bg-violet-50"
        },
        // ✅ then TOTAL BOOKS
        { title: "Total books", value: kpis?.total_books ?? "—", tone: "bg-sky-50" },
        { title: "Available copies", value: kpis?.available_copies ?? "—", tone: "bg-emerald-50" },
        { title: "Borrowed (active)", value: kpis?.borrowed_active ?? "—", tone: "bg-amber-50" },
        { title: "Overdue (active)", value: kpis?.overdue_active ?? "—", tone: "bg-rose-50" }
      ];

  // Charts data (existing)
  const pieData = isStudent
    ? {
        labels: ["Borrowed (active)", "Overdue (active)", "Returned (total)"],
        datasets: [
          {
            data: [
              Number(kpis?.my_borrowed_active ?? 0),
              Number(kpis?.my_overdue_active ?? 0),
              Number(kpis?.my_returned_total ?? 0)
            ],
            backgroundColor: ["#60a5fa", "#fb7185", "#34d399"],
            borderColor: "#ffffff",
            borderWidth: 2
          }
        ]
      }
    : {
        labels: ["Available", "Borrowed (active)", "Overdue (active)"],
        datasets: [
          {
            data: [
              Number(dist?.available ?? 0),
              Number(dist?.borrowed_active ?? 0),
              Number(dist?.overdue_active ?? 0)
            ],
            backgroundColor: ["#34d399", "#60a5fa", "#fb7185"],
            borderColor: "#ffffff",
            borderWidth: 2
          }
        ]
      };

  const barData = {
    labels: trend?.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: isStudent ? "My borrows" : "Borrows",
        data: trend?.data || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "#d4a373",
        borderRadius: 8
      }
    ]
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  // NEW: Students per course chart (Top 10)
  const topCourses = (studentStats?.students_by_course || []).slice(0, 10);
  const courseBarData = {
    labels: topCourses.map((x) => x.department),
    datasets: [
      {
        label: "Students",
        data: topCourses.map((x) => x.count),
        backgroundColor: "#60a5fa",
        borderRadius: 8
      }
    ]
  };

  const courseBarOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0, minRotation: 0 }
      },
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  const canShowMainCharts = Boolean(trend) && (isStudent ? Boolean(kpis) : Boolean(dist));

  return (
    <div>
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600 a11y-muted">
        Welcome back, <span className="font-medium">{user?.name}</span>!
      </p>

      {error ? (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <KpiCard key={c.title} title={c.title} value={c.value} tone={c.tone} />
        ))}
      </div>

      {canShowMainCharts ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Panel title={isStudent ? "My Status Distribution" : "Book Status Distribution"}>
              <div className="mx-auto max-w-[420px]">
                <Pie data={pieData} />
              </div>
            </Panel>

            <Panel title={isStudent ? "My Weekly Borrowing Trend" : "Weekly Borrowing Trend"}>
              <Bar data={barData} options={barOptions} />
            </Panel>
          </div>

          {/* NEW panel: students per course (admin/librarian only) */}
          {canSeeGlobalStats ? (
            <div className="mt-6">
              <Panel title="Students per Course (Top 10)">
                {topCourses.length === 0 ? (
                  <div className="text-sm text-slate-600 a11y-muted">
                    No student data yet.
                  </div>
                ) : (
                  <Bar data={courseBarData} options={courseBarOptions} />
                )}
              </Panel>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-6 text-sm text-slate-600 a11y-muted">Loading charts…</div>
      )}
    </div>
  );
}

function KpiCard({ title, value, tone }) {
  return (
    <div className={["rounded-2xl border border-slate-200 p-4 shadow-sm", tone].join(" ")}>
      <div className="text-xs uppercase tracking-wide text-slate-600">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}