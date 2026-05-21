import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@washingtonpost/wpds-ui-kit";
import { Button, Icon } from "@washingtonpost/wpds-ui-kit";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { LaundryOrder, Notification } from "../lib/supabase";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";

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
  fontSize: "$100",
  marginBottom: "$200",
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
  padding: "$150",
  boxShadow: "$100",
});

const StatIcon = styled("div", {
  fontSize: "$175",
  marginBottom: "$075",
});

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

const Grid2 = styled("div", {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: "$150",
  "@md": { gridTemplateColumns: "1fr" },
});

const OrderCard = styled("div", {
  backgroundColor: "$surface",
  border: "1px solid $subtle",
  borderRadius: "$075",
  padding: "$150",
  marginBottom: "$100",
  boxShadow: "$50",
  transition: "box-shadow 0.2s",
  cursor: "pointer",
  "@hover": {
    "&:hover": { boxShadow: "$200" },
  },
});

const OrderHeader = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "$075",
});

const OrderId = styled("span", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$087",
  color: "$primary",
});

const OrderMeta = styled("div", {
  display: "flex",
  gap: "$100",
  marginTop: "$075",
});

const OrderMetaItem = styled("span", {
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground-subtle",
});

const NotifCard = styled("div", {
  backgroundColor: "$surface",
  border: "1px solid $subtle",
  borderRadius: "$075",
  padding: "$125",
  marginBottom: "$075",
  transition: "background 0.2s",
  variants: {
    unread: {
      true: {
        borderLeftWidth: "3px",
        borderLeftColor: "$teal100",
        backgroundColor: "$teal600",
      },
    },
  },
});

const NotifMessage = styled("p", {
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground",
  lineHeight: "$body",
  marginBottom: "$025",
});

const NotifTime = styled("span", {
  fontFamily: "$meta",
  fontSize: "$075",
  color: "$onBackground-subtle",
});

const EmptyState = styled("div", {
  textAlign: "center",
  padding: "$250",
  color: "$onBackground-subtle",
  fontFamily: "$meta",
  fontSize: "$087",
});

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Dashboard() {
  const { customer, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const fetchData = async () => {
      if (!customer) { setLoading(false); return; }
      const [ordersRes, notifsRes] = await Promise.all([
        supabase
          .from("laundry_orders")
          .select("*")
          .eq("customer_id", customer.id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("notifications")
          .select("*")
          .eq("customer_id", customer.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);
      setOrders(ordersRes.data ?? []);
      setNotifications(notifsRes.data ?? []);
      setLoading(false);
    };
    fetchData();
  }, [customer, authLoading]);

  if (loading) return <LoadingSpinner fullPage />;

  const activeOrders = orders.filter(
    (o) => o.status !== "delivered"
  );
  const totalSpent = orders.reduce((sum, o) => sum + o.total_price, 0);
  const unreadNotifs = notifications.filter((n) => !n.is_read).length;

  return (
    <PageWrapper>
      <PageTitle>Welcome back, {customer?.name || "Customer"}!</PageTitle>
      <PageSubtitle>
        Here's an overview of your laundry activity
      </PageSubtitle>

      <StatsGrid>
        <StatCard>
          <StatIcon>📦</StatIcon>
          <StatValue>{orders.length}</StatValue>
          <StatLabel>Total Orders</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon>🔄</StatIcon>
          <StatValue>{activeOrders.length}</StatValue>
          <StatLabel>Active Orders</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon>💰</StatIcon>
          <StatValue>${totalSpent.toFixed(2)}</StatValue>
          <StatLabel>Total Spent</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon>🔔</StatIcon>
          <StatValue>{unreadNotifs}</StatValue>
          <StatLabel>Unread Alerts</StatLabel>
        </StatCard>
      </StatsGrid>

      <div style={{ marginBottom: "$150", display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="cta"
          onClick={() => navigate("/orders/new")}
          css={{ marginBottom: "$150" }}
        >
          + Place New Order
        </Button>
      </div>

      <Grid2>
        <div>
          <SectionTitle>Recent Orders</SectionTitle>
          {orders.length === 0 ? (
            <EmptyState>
              No orders yet. Place your first order!
            </EmptyState>
          ) : (
            orders.slice(0, 5).map((order) => (
              <OrderCard
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}/track`)}
              >
                <OrderHeader>
                  <OrderId>#{order.id.slice(0, 8).toUpperCase()}</OrderId>
                  <StatusBadge status={order.status} />
                </OrderHeader>
                <OrderMeta>
                  <OrderMetaItem>
                    {new Date(order.created_at).toLocaleDateString()}
                  </OrderMetaItem>
                  <OrderMetaItem>·</OrderMetaItem>
                  <OrderMetaItem>{order.total_quantity} items</OrderMetaItem>
                  <OrderMetaItem>·</OrderMetaItem>
                  <OrderMetaItem>{order.total_weight}kg</OrderMetaItem>
                  <OrderMetaItem>·</OrderMetaItem>
                  <OrderMetaItem
                    css={{ fontWeight: "$bold", color: "$teal100" }}
                  >
                    ${order.total_price.toFixed(2)}
                  </OrderMetaItem>
                </OrderMeta>
              </OrderCard>
            ))
          )}
          {orders.length > 0 && (
            <Button
              variant="secondary"
              density="compact"
              onClick={() => navigate("/orders")}
              css={{ marginTop: "$075" }}
            >
              View All Orders →
            </Button>
          )}
        </div>

        <div>
          <SectionTitle>Notifications</SectionTitle>
          {notifications.length === 0 ? (
            <EmptyState>No notifications yet.</EmptyState>
          ) : (
            notifications.map((n) => (
              <NotifCard key={n.id} unread={!n.is_read ? true : undefined}>
                <NotifMessage>{n.message}</NotifMessage>
                <NotifTime>{timeAgo(n.created_at)}</NotifTime>
              </NotifCard>
            ))
          )}
          {notifications.length > 0 && (
            <Button
              variant="secondary"
              density="compact"
              onClick={() => navigate("/notifications")}
              css={{ marginTop: "$075" }}
            >
              View All →
            </Button>
          )}
        </div>
      </Grid2>
    </PageWrapper>
  );
}
