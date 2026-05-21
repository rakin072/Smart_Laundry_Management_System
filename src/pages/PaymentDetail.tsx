import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { styled } from "@washingtonpost/wpds-ui-kit";
import { Button } from "@washingtonpost/wpds-ui-kit";
import { supabase } from "../lib/supabase";
import type { Payment, LaundryOrder } from "../lib/supabase";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";

const PageWrapper = styled("div", {
  maxWidth: "600px",
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

const Card = styled("div", {
  backgroundColor: "$surface",
  border: "1px solid $subtle",
  borderRadius: "$075",
  padding: "$250",
  boxShadow: "$200",
});

const CardTitle = styled("h1", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$200",
  color: "$primary",
  marginBottom: "$050",
});

const CardSubtitle = styled("p", {
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground-subtle",
  marginBottom: "$200",
});

const Row = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "$100 0",
  borderBottom: "1px solid $subtle",
  "&:last-of-type": { borderBottom: "none" },
});

const RowLabel = styled("span", {
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground-subtle",
});

const RowValue = styled("span", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$087",
  color: "$onBackground",
});

const AmountRow = styled("div", {
  backgroundColor: "$teal600",
  borderRadius: "$050",
  padding: "$150",
  textAlign: "center",
  marginBottom: "$150",
});

const Amount = styled("div", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$300",
  color: "$teal100",
  lineHeight: 1,
});

const AmountLabel = styled("div", {
  fontFamily: "$meta",
  fontSize: "$075",
  color: "$onBackground-subtle",
  marginTop: "$025",
});

const PaymentBadge = styled("span", {
  display: "inline-block",
  padding: "$025 $075",
  borderRadius: "$round",
  fontFamily: "$meta",
  fontSize: "$075",
  fontWeight: "$bold",
  textTransform: "uppercase",
  variants: {
    status: {
      pending: { backgroundColor: "$mustard600", color: "$mustard100" },
      paid: { backgroundColor: "$green600", color: "$green100" },
      failed: { backgroundColor: "$red600", color: "$error" },
    },
  },
});

export default function PaymentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [order, setOrder] = useState<LaundryOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const [orderRes, paymentRes] = await Promise.all([
        supabase.from("laundry_orders").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("payments")
          .select("*")
          .eq("order_id", id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      setOrder(orderRes.data);
      setPayment(paymentRes.data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <PageWrapper>
      <BackBtn onClick={() => navigate(`/orders/${id}/track`)}>
        ← Back to Tracking
      </BackBtn>

      <Card>
        <CardTitle>Payment Details</CardTitle>
        <CardSubtitle>
          Order #{id?.slice(0, 8).toUpperCase()}
        </CardSubtitle>

        {payment ? (
          <>
            <AmountRow>
              <Amount>${payment.amount.toFixed(2)}</Amount>
              <AmountLabel>Total Amount</AmountLabel>
            </AmountRow>

            <Row>
              <RowLabel>Payment Status</RowLabel>
              <PaymentBadge status={payment.status}>
                {payment.status}
              </PaymentBadge>
            </Row>
            <Row>
              <RowLabel>Payment Method</RowLabel>
              <RowValue style={{ textTransform: "capitalize" }}>
                {payment.method === "cash"
                  ? "💵 Cash"
                  : payment.method === "card"
                  ? "💳 Card"
                  : "📱 Mobile"}
              </RowValue>
            </Row>
            <Row>
              <RowLabel>Order Date</RowLabel>
              <RowValue>
                {order
                  ? new Date(order.created_at).toLocaleDateString()
                  : "—"}
              </RowValue>
            </Row>
            {payment.payment_date && (
              <Row>
                <RowLabel>Payment Date</RowLabel>
                <RowValue>
                  {new Date(payment.payment_date).toLocaleDateString()}
                </RowValue>
              </Row>
            )}
            {order && (
              <>
                <Row>
                  <RowLabel>Order Status</RowLabel>
                  <RowValue>
                    <StatusBadge status={order.status} />
                  </RowValue>
                </Row>
                <Row>
                  <RowLabel>Total Weight</RowLabel>
                  <RowValue>{order.total_weight}kg</RowValue>
                </Row>
                <Row>
                  <RowLabel>Total Items</RowLabel>
                  <RowValue>{order.total_quantity}</RowValue>
                </Row>
              </>
            )}
          </>
        ) : (
          <p
            style={{
              fontFamily: "var(--wpds-fonts-meta)",
              color: "var(--wpds-colors-onBackground-subtle)",
              textAlign: "center",
              padding: "32px",
            }}
          >
            No payment record found for this order.
          </p>
        )}

        <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <Button
            variant="cta"
            density="compact"
            onClick={() => navigate(`/orders/${id}/track`)}
          >
            Track Order
          </Button>
          <Button
            variant="secondary"
            density="compact"
            isOutline
            onClick={() => navigate("/orders")}
          >
            All Orders
          </Button>
        </div>
      </Card>
    </PageWrapper>
  );
}
