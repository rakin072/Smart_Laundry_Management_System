import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { styled, keyframes } from "@washingtonpost/wpds-ui-kit";
import { Button } from "@washingtonpost/wpds-ui-kit";
import { supabase } from "../lib/supabase";
import type { LaundryOrder, OrderItem, StatusHistory } from "../lib/supabase";
import type { OrderStatus } from "../lib/supabase";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";

const pulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.5 },
});

const PageWrapper = styled("div", {
  maxWidth: "800px",
  margin: "0 auto",
  padding: "$200 $150",
  "@sm": { padding: "$150 $100" },
});

const BackBtn = styled("button", {
  background: "none",
  border: "none",
  color: "$teal100",
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$087",
  cursor: "pointer",
  padding: 0,
  marginBottom: "$150",
  "&:hover": { textDecoration: "underline" },
});

const OrderCard = styled("div", {
  backgroundColor: "$surface",
  border: "1px solid $subtle",
  borderRadius: "$075",
  padding: "$200",
  boxShadow: "$200",
  marginBottom: "$200",
});

const OrderHeader = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "$150",
  flexWrap: "wrap",
  gap: "$100",
});

const OrderTitle = styled("h1", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$200",
  color: "$primary",
});

const OrderMeta = styled("div", {
  display: "flex",
  gap: "$150",
  flexWrap: "wrap",
  marginBottom: "$200",
});

const MetaItem = styled("div", {
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground-subtle",
  "& strong": { color: "$onBackground", fontWeight: "$bold" },
});

const StepperContainer = styled("div", {
  marginBottom: "$200",
});

const StepperTitle = styled("h2", {
  fontFamily: "$subhead",
  fontWeight: "$bold",
  fontSize: "$125",
  color: "$primary",
  marginBottom: "$150",
});

const Steps = styled("div", {
  display: "flex",
  alignItems: "center",
  "@sm": { flexDirection: "column", alignItems: "flex-start" },
});

const Step = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: 1,
  "@sm": {
    flexDirection: "row",
    alignItems: "center",
    flex: "none",
    width: "100%",
    gap: "$100",
    padding: "$075 0",
  },
});

const StepDot = styled("div", {
  width: "44px",
  height: "44px",
  borderRadius: "$round",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$075",
  flexShrink: 0,
  variants: {
    state: {
      done: {
        backgroundColor: "$teal100",
        color: "white",
      },
      active: {
        backgroundColor: "$blue100",
        color: "white",
        animation: `${pulse} 2s ease-in-out infinite`,
      },
      pending: {
        backgroundColor: "$surface",
        border: "2px solid $subtle",
        color: "$onBackground-subtle",
      },
    },
  },
});

const StepLabel = styled("div", {
  fontFamily: "$meta",
  fontSize: "$075",
  textAlign: "center",
  marginTop: "$050",
  "@sm": { marginTop: 0, fontSize: "$087" },
  variants: {
    state: {
      done: { color: "$teal100", fontWeight: "$bold" },
      active: { color: "$blue100", fontWeight: "$bold" },
      pending: { color: "$onBackground-subtle" },
    },
  },
});

const Connector = styled("div", {
  flex: 1,
  height: "3px",
  "@sm": {
    width: "3px",
    height: "24px",
    flex: "none",
    marginLeft: "20px",
  },
  variants: {
    done: {
      true: { backgroundColor: "$teal100" },
      false: { backgroundColor: "$subtle" },
    },
  },
});

const SectionTitle = styled("h2", {
  fontFamily: "$subhead",
  fontWeight: "$bold",
  fontSize: "$125",
  color: "$primary",
  marginBottom: "$100",
});

const ItemList = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "$075",
});

const ItemCard = styled("div", {
  backgroundColor: "$background-forSurfaces",
  borderRadius: "$050",
  padding: "$100 $125",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontFamily: "$meta",
  fontSize: "$087",
});

const HistoryList = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "$075",
  marginTop: "$100",
});

const HistoryItem = styled("div", {
  display: "flex",
  gap: "$100",
  alignItems: "flex-start",
});

const HistoryDot = styled("div", {
  width: "10px",
  height: "10px",
  borderRadius: "$round",
  backgroundColor: "$teal100",
  marginTop: "5px",
  flexShrink: 0,
});

const HistoryText = styled("div", {
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground",
  "& span": { color: "$onBackground-subtle", fontSize: "$075", display: "block", marginTop: "$025" },
});

const ORDER_STEPS: OrderStatus[] = [
  "collected",
  "washing",
  "drying",
  "ironing",
  "ready",
  "delivered",
];

const STEP_LABELS: Record<OrderStatus, string> = {
  collected: "Collected",
  washing: "Washing",
  drying: "Drying",
  ironing: "Ironing",
  ready: "Ready",
  delivered: "Delivered",
};

const STEP_ICONS: Record<OrderStatus, string> = {
  collected: "📦",
  washing: "🫧",
  drying: "💨",
  ironing: "👔",
  ready: "✅",
  delivered: "🚚",
};

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<LaundryOrder | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      const [orderRes, itemsRes, historyRes] = await Promise.all([
        supabase.from("laundry_orders").select("*").eq("id", id).maybeSingle(),
        supabase.from("order_items").select("*").eq("order_id", id),
        supabase
          .from("status_history")
          .select("*")
          .eq("order_id", id)
          .order("updated_at", { ascending: false }),
      ]);
      setOrder(orderRes.data);
      setItems(itemsRes.data ?? []);
      setHistory(historyRes.data ?? []);
      setLoading(false);
    };
    fetchAll();

    const channel = supabase
      .channel(`order-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "laundry_orders",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setOrder(payload.new as LaundryOrder);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!order) return (
    <PageWrapper>
      <p style={{ fontFamily: "var(--wpds-fonts-meta)", color: "var(--wpds-colors-error)" }}>
        Order not found.
      </p>
    </PageWrapper>
  );

  const currentStepIndex = ORDER_STEPS.indexOf(order.status);

  const stepState = (i: number) => {
    if (i < currentStepIndex) return "done";
    if (i === currentStepIndex) return "active";
    return "pending";
  };

  return (
    <PageWrapper>
      <BackBtn onClick={() => navigate("/orders")}>← Back to Orders</BackBtn>

      <OrderCard>
        <OrderHeader>
          <div>
            <OrderTitle>
              Order #{order.id.slice(0, 8).toUpperCase()}
            </OrderTitle>
            <p
              style={{
                fontFamily: "var(--wpds-fonts-meta)",
                fontSize: "var(--wpds-fontSizes-087)",
                color: "var(--wpds-colors-onBackground-subtle)",
                marginTop: "4px",
              }}
            >
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </OrderHeader>

        <OrderMeta>
          <MetaItem>
            Items: <strong>{order.total_quantity}</strong>
          </MetaItem>
          <MetaItem>
            Weight: <strong>{order.total_weight}kg</strong>
          </MetaItem>
          <MetaItem>
            Total: <strong style={{ color: "var(--wpds-colors-teal100)" }}>${order.total_price.toFixed(2)}</strong>
          </MetaItem>
        </OrderMeta>

        <StepperContainer>
          <StepperTitle>Live Tracking</StepperTitle>
          <Steps>
            {ORDER_STEPS.map((status, i) => (
              <>
                {i > 0 && (
                  <Connector
                    key={`conn-${i}`}
                    done={i <= currentStepIndex ? true : false}
                  />
                )}
                <Step key={status}>
                  <StepDot state={stepState(i)}>
                    {stepState(i) === "done" ? "✓" : STEP_ICONS[status]}
                  </StepDot>
                  <StepLabel state={stepState(i)}>
                    {STEP_LABELS[status]}
                  </StepLabel>
                </Step>
              </>
            ))}
          </Steps>
        </StepperContainer>

        {items.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <SectionTitle>Items in This Order</SectionTitle>
            <ItemList>
              {items.map((item) => (
                <ItemCard key={item.id}>
                  <span>
                    <strong>{item.cloth_type}</strong> ×{item.quantity}
                  </span>
                  <span style={{ color: "var(--wpds-colors-onBackground-subtle)" }}>
                    {item.weight}kg
                  </span>
                </ItemCard>
              ))}
            </ItemList>
          </div>
        )}

        {history.length > 0 && (
          <div>
            <SectionTitle>Status Timeline</SectionTitle>
            <HistoryList>
              {history.map((h) => (
                <HistoryItem key={h.id}>
                  <HistoryDot />
                  <HistoryText>
                    <StatusBadge status={h.status} />
                    {h.notes && <span style={{ marginTop: "4px" }}>{h.notes}</span>}
                    <span>
                      {new Date(h.updated_at).toLocaleString()}
                    </span>
                  </HistoryText>
                </HistoryItem>
              ))}
            </HistoryList>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <Button
            variant="cta"
            density="compact"
            onClick={() => navigate(`/orders/${order.id}/payment`)}
          >
            View Payment
          </Button>
          <Button
            variant="secondary"
            density="compact"
            onClick={() => navigate("/orders/new")}
          >
            Place New Order
          </Button>
        </div>
      </OrderCard>
    </PageWrapper>
  );
}
