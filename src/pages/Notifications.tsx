import { useEffect, useState } from "react";
import { styled } from "@washingtonpost/wpds-ui-kit";
import { Button } from "@washingtonpost/wpds-ui-kit";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { Notification } from "../lib/supabase";
import LoadingSpinner from "../components/LoadingSpinner";

const PageWrapper = styled("div", {
  maxWidth: "800px",
  margin: "0 auto",
  padding: "$200 $150",
  "@sm": { padding: "$150 $100" },
});

const PageHeader = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "$200",
  flexWrap: "wrap",
  gap: "$100",
});

const PageTitle = styled("h1", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$225",
  color: "$primary",
});

const NotifCard = styled("div", {
  backgroundColor: "$surface",
  border: "1px solid $subtle",
  borderRadius: "$075",
  padding: "$150",
  marginBottom: "$075",
  display: "flex",
  gap: "$125",
  alignItems: "flex-start",
  transition: "background 0.2s, box-shadow 0.2s",
  cursor: "pointer",
  variants: {
    unread: {
      true: {
        borderLeftWidth: "4px",
        borderLeftColor: "$teal100",
        backgroundColor: "$teal600",
        boxShadow: "$100",
      },
    },
  },
  "@hover": {
    "&:hover": { boxShadow: "$200" },
  },
});

const NotifDot = styled("div", {
  width: "10px",
  height: "10px",
  borderRadius: "$round",
  flexShrink: 0,
  marginTop: "4px",
  variants: {
    unread: {
      true: { backgroundColor: "$teal100" },
      false: { backgroundColor: "$subtle" },
    },
  },
});

const NotifContent = styled("div", {
  flex: 1,
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
  padding: "$400",
  color: "$onBackground-subtle",
  fontFamily: "$meta",
  "& div": { fontSize: "$300", marginBottom: "$100" },
});

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications() {
  const { customer, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!customer) { setLoading(false); return; }
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });
    setNotifications(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) fetchNotifications();
  }, [customer, authLoading]);

  const markAllRead = async () => {
    if (!customer) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("customer_id", customer.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  if (loading) return <LoadingSpinner fullPage />;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <PageWrapper>
      <PageHeader>
        <div>
          <PageTitle>Notifications</PageTitle>
          {unreadCount > 0 && (
            <p
              style={{
                fontFamily: "var(--wpds-fonts-meta)",
                fontSize: "var(--wpds-fontSizes-087)",
                color: "var(--wpds-colors-teal100)",
                marginTop: "4px",
              }}
            >
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            density="compact"
            isOutline
            onClick={markAllRead}
          >
            Mark All Read
          </Button>
        )}
      </PageHeader>

      {notifications.length === 0 ? (
        <EmptyState>
          <div>🔔</div>
          <p>No notifications yet.</p>
          <p style={{ fontSize: "var(--wpds-fontSizes-075)" }}>
            You'll be notified when your order status changes.
          </p>
        </EmptyState>
      ) : (
        notifications.map((n) => (
          <NotifCard
            key={n.id}
            unread={!n.is_read ? true : undefined}
            onClick={() => !n.is_read && markRead(n.id)}
          >
            <NotifDot unread={!n.is_read ? true : false} />
            <NotifContent>
              <NotifMessage>{n.message}</NotifMessage>
              <NotifTime>{timeAgo(n.created_at)}</NotifTime>
            </NotifContent>
          </NotifCard>
        ))
      )}
    </PageWrapper>
  );
}
