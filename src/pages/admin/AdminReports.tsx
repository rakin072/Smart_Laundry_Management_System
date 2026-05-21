import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@washingtonpost/wpds-ui-kit";
import { supabase } from "../../lib/supabase";
import LoadingSpinner from "../../components/LoadingSpinner";

const PageWrapper = styled("div", {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "$200 $150",
  "@sm": { padding: "$150 $100" },
});

const AdminNav = styled("div", {
  display: "flex",
  gap: "$075",
  marginBottom: "$200",
  flexWrap: "wrap",
});

const AdminNavBtn = styled("button", {
  border: "1px solid $subtle",
  borderRadius: "$050",
  padding: "$075 $125",
  fontFamily: "$meta",
  fontSize: "$087",
  cursor: "pointer",
  backgroundColor: "$surface",
  color: "$onBackground",
  "&:hover": { borderColor: "$teal100", color: "$teal100" },
  variants: {
    active: {
      true: { backgroundColor: "$teal100", color: "white", borderColor: "$teal100" },
    },
  },
});

const PageTitle = styled("h1", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$225",
  color: "$primary",
  marginBottom: "$200",
});

const Grid2 = styled("div", {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "$200",
  "@md": { gridTemplateColumns: "1fr" },
});

const ChartCard = styled("div", {
  backgroundColor: "$surface",
  border: "1px solid $subtle",
  borderRadius: "$075",
  padding: "$200",
  boxShadow: "$100",
});

const ChartTitle = styled("h2", {
  fontFamily: "$subhead",
  fontWeight: "$bold",
  fontSize: "$125",
  color: "$primary",
  marginBottom: "$150",
});

const BarChart = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "$075",
});

const BarRow = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "$100",
});

const BarLabel = styled("span", {
  fontFamily: "$meta",
  fontSize: "$075",
  color: "$onBackground-subtle",
  width: "80px",
  flexShrink: 0,
  textAlign: "right",
});

const BarTrack = styled("div", {
  flex: 1,
  height: "24px",
  backgroundColor: "$background-forSurfaces",
  borderRadius: "$round",
  overflow: "hidden",
});

const BarFill = styled("div", {
  height: "100%",
  borderRadius: "$round",
  transition: "width 0.5s ease",
  background: "linear-gradient(90deg, #0a9396, #1b6ca8)",
});

const BarValue = styled("span", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$075",
  color: "$onBackground",
  width: "40px",
});

const PieGrid = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  gap: "$100",
  justifyContent: "center",
});

const PieItem = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "$050",
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground",
});

const PieDot = styled("div", {
  width: "12px",
  height: "12px",
  borderRadius: "$round",
  flexShrink: 0,
});

const SummaryCards = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "$125",
  marginBottom: "$200",
  "@sm": { gridTemplateColumns: "1fr 1fr" },
});

const SummaryCard = styled("div", {
  backgroundColor: "$surface",
  border: "1px solid $subtle",
  borderRadius: "$075",
  padding: "$150",
  textAlign: "center",
  boxShadow: "$100",
});

const SummaryValue = styled("div", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$225",
  color: "$teal100",
  lineHeight: 1,
  marginBottom: "$025",
});

const SummaryLabel = styled("div", {
  fontFamily: "$meta",
  fontSize: "$075",
  color: "$onBackground-subtle",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});

const STATUS_COLORS: Record<string, string> = {
  collected: "#aaa",
  washing: "#166dfc",
  drying: "#f3750e",
  ironing: "#ff4f83",
  ready: "#36a75c",
  delivered: "#03afca",
};

interface DayRevenue {
  date: string;
  revenue: number;
  orders: number;
}

interface StatusCount {
  status: string;
  count: number;
}

export default function AdminReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [weekRevenue, setWeekRevenue] = useState<DayRevenue[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [summary, setSummary] = useState({ totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const [ordersRes] = await Promise.all([
        supabase.from("laundry_orders").select("*").order("created_at"),
      ]);

      const orders = ordersRes.data ?? [];

      const totalRevenue = orders.reduce((sum, o) => sum + o.total_price, 0);
      setSummary({
        totalOrders: orders.length,
        totalRevenue,
        avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      });

      // Status distribution
      const statusMap: Record<string, number> = {};
      orders.forEach((o) => {
        statusMap[o.status] = (statusMap[o.status] ?? 0) + 1;
      });
      setStatusCounts(
        Object.entries(statusMap).map(([status, count]) => ({ status, count }))
      );

      // Last 7 days revenue
      const days: DayRevenue[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const dayOrders = orders.filter(
          (o) => o.created_at.startsWith(dateStr)
        );
        days.push({
          date: d.toLocaleDateString("en", { weekday: "short" }),
          revenue: dayOrders.reduce((sum, o) => sum + o.total_price, 0),
          orders: dayOrders.length,
        });
      }
      setWeekRevenue(days);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const maxRevenue = Math.max(...weekRevenue.map((d) => d.revenue), 1);
  const maxOrders = Math.max(...weekRevenue.map((d) => d.orders), 1);
  const totalStatusCount = statusCounts.reduce((s, c) => s + c.count, 0);

  return (
    <PageWrapper>
      <AdminNav>
        <AdminNavBtn onClick={() => navigate("/admin-panel")}>Dashboard</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/orders")}>Orders</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/customers")}>Customers</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/services")}>Services</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/payments")}>Payments</AdminNavBtn>
        <AdminNavBtn active>Reports</AdminNavBtn>
      </AdminNav>

      <PageTitle>Reports & Analytics</PageTitle>

      <SummaryCards>
        <SummaryCard>
          <SummaryValue>{summary.totalOrders}</SummaryValue>
          <SummaryLabel>Total Orders</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>${summary.totalRevenue.toFixed(0)}</SummaryValue>
          <SummaryLabel>Total Revenue</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>${summary.avgOrderValue.toFixed(2)}</SummaryValue>
          <SummaryLabel>Avg Order Value</SummaryLabel>
        </SummaryCard>
      </SummaryCards>

      <Grid2>
        <ChartCard>
          <ChartTitle>Revenue — Last 7 Days</ChartTitle>
          <BarChart>
            {weekRevenue.map((d) => (
              <BarRow key={d.date}>
                <BarLabel>{d.date}</BarLabel>
                <BarTrack>
                  <BarFill
                    css={{ width: `${(d.revenue / maxRevenue) * 100}%` }}
                  />
                </BarTrack>
                <BarValue>${d.revenue.toFixed(0)}</BarValue>
              </BarRow>
            ))}
          </BarChart>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Orders by Status</ChartTitle>
          {statusCounts.length === 0 ? (
            <p style={{ fontFamily: "var(--wpds-fonts-meta)", color: "var(--wpds-colors-onBackground-subtle)", textAlign: "center", padding: "32px" }}>
              No data yet
            </p>
          ) : (
            <>
              <BarChart style={{ marginBottom: "24px" }}>
                {statusCounts.map((sc) => (
                  <BarRow key={sc.status}>
                    <BarLabel style={{ textTransform: "capitalize" }}>{sc.status}</BarLabel>
                    <BarTrack>
                      <div
                        style={{
                          height: "100%",
                          width: `${(sc.count / totalStatusCount) * 100}%`,
                          backgroundColor: STATUS_COLORS[sc.status] ?? "#aaa",
                          borderRadius: "9999px",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </BarTrack>
                    <BarValue>{sc.count}</BarValue>
                  </BarRow>
                ))}
              </BarChart>
              <PieGrid>
                {statusCounts.map((sc) => (
                  <PieItem key={sc.status}>
                    <PieDot css={{ backgroundColor: STATUS_COLORS[sc.status] ?? "#aaa" }} />
                    <span style={{ textTransform: "capitalize" }}>{sc.status}</span>
                    <span style={{ color: "var(--wpds-colors-onBackground-subtle)", marginLeft: "4px" }}>
                      ({Math.round((sc.count / totalStatusCount) * 100)}%)
                    </span>
                  </PieItem>
                ))}
              </PieGrid>
            </>
          )}
        </ChartCard>

        <ChartCard>
          <ChartTitle>Orders per Day — Last 7 Days</ChartTitle>
          <BarChart>
            {weekRevenue.map((d) => (
              <BarRow key={d.date}>
                <BarLabel>{d.date}</BarLabel>
                <BarTrack>
                  <div
                    style={{
                      height: "100%",
                      width: `${(d.orders / maxOrders) * 100}%`,
                      background: "linear-gradient(90deg, #36a75c, #03afca)",
                      borderRadius: "9999px",
                      transition: "width 0.5s ease",
                    }}
                  />
                </BarTrack>
                <BarValue>{d.orders}</BarValue>
              </BarRow>
            ))}
          </BarChart>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Quick Stats</ChartTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Highest single order", value: `$${Math.max(...(weekRevenue.map(d => d.revenue)), 0).toFixed(2)}` },
              { label: "Best day (orders)", value: `${Math.max(...weekRevenue.map(d => d.orders), 0)}` },
              { label: "Avg revenue/day", value: `$${(weekRevenue.reduce((s, d) => s + d.revenue, 0) / 7).toFixed(2)}` },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--wpds-colors-subtle)",
                  fontFamily: "var(--wpds-fonts-meta)",
                  fontSize: "var(--wpds-fontSizes-087)",
                }}
              >
                <span style={{ color: "var(--wpds-colors-onBackground-subtle)" }}>{item.label}</span>
                <strong style={{ color: "var(--wpds-colors-teal100)" }}>{item.value}</strong>
              </div>
            ))}
          </div>
        </ChartCard>
      </Grid2>
    </PageWrapper>
  );
}
