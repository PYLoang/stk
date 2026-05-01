import {
  ChartAndLowStock,
  RecentActivity,
  StatStrip,
  loadDashboardData,
} from "@/components/dashboard-body";
import { Clock } from "@/components/clock";

export default async function Home() {
  const data = await loadDashboardData();
  return (
    <div className="page">
      <div
        className="row between"
        style={{
          paddingBottom: 14,
          marginBottom: 24,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div className="eyebrow">Overview</div>
        <Clock />
      </div>
      <StatStrip data={data} />
      <ChartAndLowStock data={data} />
      <RecentActivity data={data} />
    </div>
  );
}
