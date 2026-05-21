import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@washingtonpost/wpds-ui-kit";
import { Button } from "@washingtonpost/wpds-ui-kit";
import { supabase } from "../../lib/supabase";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../../components/StatusBadge";
import type { LaundryOrder } from "../../lib/supabase";

const PageWrapper = styled("div", {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "$200 $150",
  "@sm": { padding: "$150 $100" },
});

const PageTitle = styled("h1", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$250",
  color: "$primary",
  marginBottom: "$050",
});

const PageSubtitle = styled("p", {
  fontFamily: "$meta",
  color: "$onBackground-subtle",
  marginBottom: "$200",
});

const AdminNav = styled("div", {
  display: "flex",
  gap: "$075",
  marginBottom: "$250",
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
  transition: "all 0.15s",
  "&:hover": {
    borderColor: "$teal100",
    color: "$teal100",
    backgroundColor: "$teal600",
  },
  variants: {
    active: {
      true: {
        backgroundColor: "$teal100",
        color: "white",
        borderColor: "$teal100",
      },
    },
  },
});

const StatsGrid = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "$125",
  marginBottom: "$250",
  "@md": { gridTemplateColumns: "repeat(2, 1fr)" },
  "@sm": { gridTemplateColumns: "repeat(2, 1fr)" },
});

const StatCard = styled("div", {
  backgroundColor: "$surface",
  border: "1px solid $subtle",
  borderRadius: "$075",
  padding: "$175",
  boxShadow: "$100",
});

const StatIcon = styled("div", { fontSize: "$200", marginBottom: "$075" });
const StatValue = styled("div", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$250",
  color: "$primary",
  lineHeight: 1,
  marginBottom: "$025",
});
const StatLabel = styled("div", {
  fontFamily: "$meta",
  fontSize: "$075",
  color: "$onBackground-subtle",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});

const SectionTitle = styled("h2", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$175",
  color: "$primary",
  marginBottom: "$125",
});

const Table = styled("table", {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "$surface",
  border: "1px solid $subtle",
  borderRadius: "$075",
  overflow: "hidden",
  boxShadow: "$100",
});

const Th = styled("th", {
  padding: "$100 $125",
  textAlign: "left",
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$075",
  color: "$onBackground-subtle",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  backgroundColor: "$background-forSurfaces",
  borderBottom: "1px solid $subtle",
});

const Td = styled("td", {
  padding: "$100 $125",
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground",
  borderBottom: "1px solid $subtle",
});

const Tr = styled("tr", {
  transition: "background 0.15s",
  "@hover": {
    "&:hover": { backgroundColor: "$teal600" },
  },
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    revenueToday: 0,
  });
  const [recentOrders, setRecentOrders] = useState<LaundryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [ordersRes, customersRes, revenueRes] = await Promise.all([
        supabase.from("laundry_orders").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase
          .from("laundry_orders")
          .select("total_price")
          .gte("created_at", today.toISOString()),
      ]);

      const orders = ordersRes.data ?? [];
      const revenueToday = (revenueRes.data ?? []).reduce(
        (sum: number, o: { total_price: number }) => sum + o.total_price,
        0
      );

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(
          (o) => o.status !== "delivered"
        ).length,
        totalCustomers: customersRes.count ?? 0,
        revenueToday,
      });
      setRecentOrders(orders.slice(0, 8));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <PageWrapper>
      <PageTitle>Admin Dashboard</PageTitle>
      <PageSubtitle>Overview of your laundry management system</PageSubtitle>

      <AdminNav>
        <AdminNavBtn active onClick={() => navigate("/admin-panel")}>
          Dashboard
        </AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/orders")}>
          Orders
        </AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/customers")}>
          Customers
        </AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/services")}>
          Services
        </AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/payments")}>
          Payments
        </AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/reports")}>
          Reports
        </AdminNavBtn>
      </AdminNav>

      <StatsGrid>
        <StatCard>
          <StatIcon>📦</StatIcon>
          <StatValue>{stats.totalOrders}</StatValue>
          <StatLabel>Total Orders</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon>⏳</StatIcon>
          <StatValue>{stats.pendingOrders}</StatValue>
          <StatLabel>Active Orders</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon>👥</StatIcon>
          <StatValue>{stats.totalCustomers}</StatValue>
          <StatLabel>Customers</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon>💰</StatIcon>
          <StatValue>${stats.revenueToday.toFixed(0)}</StatValue>
          <StatLabel>Revenue Today</StatLabel>
        </StatCard>
      </StatsGrid>

      <SectionTitle>Recent Orders</SectionTitle>
      <div style={{ overflowX: "auto" }}>
        <Table>
          <thead>
            <tr>
              <Th>Order ID</Th>
              <Th>Date</Th>
              <Th>Weight</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <Tr key={order.id}>
                <Td>#{order.id.slice(0, 8).toUpperCase()}</Td>
                <Td>{new Date(order.created_at).toLocaleDateString()}</Td>
                <Td>{order.total_weight}kg</Td>
                <Td>
                  <strong style={{ color: "var(--wpds-colors-teal100)" }}>
                    ${order.total_price.toFixed(2)}
                  </strong>
                </Td>
                <Td>
                  <StatusBadge status={order.status} />
                </Td>
                <Td>
                  <button
                    onClick={() => navigate("/admin-panel/orders")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--wpds-colors-teal100)",
                      fontFamily: "var(--wpds-fonts-meta)",
                      fontSize: "var(--wpds-fontSizes-075)",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Manage →
                  </button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </PageWrapper>
  );
}
