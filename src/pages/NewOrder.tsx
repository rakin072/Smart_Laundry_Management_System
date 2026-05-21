import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@washingtonpost/wpds-ui-kit";
import { Button, InputText, Icon } from "@washingtonpost/wpds-ui-kit";
import Check from "@washingtonpost/wpds-assets/asset/check";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { Service } from "../lib/supabase";
import { Toast, useToast } from "../components/Toast";
import LoadingSpinner from "../components/LoadingSpinner";

const PageWrapper = styled("div", {
  maxWidth: "800px",
  margin: "0 auto",
  padding: "$200 $150",
  "@sm": { padding: "$150 $100" },
});

const PageTitle = styled("h1", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$225",
  color: "$primary",
  marginBottom: "$200",
  textAlign: "center",
});

const StepperBar = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "$250",
  gap: 0,
});

const StepItem = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: 1,
  maxWidth: "160px",
});

const StepCircle = styled("div", {
  width: "40px",
  height: "40px",
  borderRadius: "$round",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$087",
  border: "2px solid",
  transition: "all 0.2s",
  variants: {
    state: {
      done: {
        backgroundColor: "$teal100",
        borderColor: "$teal100",
        color: "white",
      },
      active: {
        backgroundColor: "$blue100",
        borderColor: "$blue100",
        color: "white",
      },
      pending: {
        backgroundColor: "$surface",
        borderColor: "$subtle",
        color: "$onBackground-subtle",
      },
    },
  },
});

const StepLabel = styled("span", {
  fontFamily: "$meta",
  fontSize: "$075",
  marginTop: "$025",
  textAlign: "center",
  variants: {
    active: {
      true: { color: "$blue100", fontWeight: "$bold" },
      false: { color: "$onBackground-subtle" },
    },
  },
});

const StepConnector = styled("div", {
  flex: 1,
  height: "2px",
  backgroundColor: "$subtle",
  maxWidth: "80px",
  variants: {
    done: {
      true: { backgroundColor: "$teal100" },
    },
  },
});

const StepContent = styled("div", {
  backgroundColor: "$surface",
  border: "1px solid $subtle",
  borderRadius: "$075",
  padding: "$250",
  boxShadow: "$200",
});

const StepTitle = styled("h2", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$175",
  color: "$primary",
  marginBottom: "$150",
});

const ItemRow = styled("div", {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr auto",
  gap: "$100",
  alignItems: "end",
  marginBottom: "$100",
  "@sm": { gridTemplateColumns: "1fr 1fr", gap: "$075" },
});

const ServiceGrid = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "$100",
  "@sm": { gridTemplateColumns: "1fr" },
});

const ServiceCard = styled("div", {
  border: "2px solid",
  borderRadius: "$075",
  padding: "$125",
  cursor: "pointer",
  transition: "all 0.2s",
  variants: {
    selected: {
      true: {
        borderColor: "$teal100",
        backgroundColor: "$teal600",
      },
      false: {
        borderColor: "$subtle",
        backgroundColor: "$surface",
        "@hover": {
          "&:hover": { borderColor: "$teal100" },
        },
      },
    },
  },
});

const ServiceName = styled("div", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$100",
  color: "$primary",
  marginBottom: "$025",
});

const ServiceDesc = styled("div", {
  fontFamily: "$meta",
  fontSize: "$075",
  color: "$onBackground-subtle",
  marginBottom: "$075",
});

const ServicePrice = styled("div", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$087",
  color: "$teal100",
});

const SummaryRow = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  padding: "$075 0",
  borderBottom: "1px solid $subtle",
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground",
});

const TotalRow = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  padding: "$100 0",
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$150",
  color: "$teal100",
});

const BtnRow = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "$200",
  gap: "$100",
});

interface OrderItem {
  cloth_type: string;
  quantity: number;
  weight: number;
  notes: string;
}

const STEPS = ["Select Items", "Choose Services", "Confirm & Submit"];

export default function NewOrder() {
  const [step, setStep] = useState(0);
  const [items, setItems] = useState<OrderItem[]>([
    { cloth_type: "", quantity: 1, weight: 0, notes: "" },
  ]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile">("cash");
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const { customer } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .then(({ data }) => {
        setServices(data ?? []);
        setServicesLoading(false);
      });
  }, []);

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { cloth_type: "", quantity: 1, weight: 0, notes: "" },
    ]);

  const removeItem = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const updateItem = (
    i: number,
    field: keyof OrderItem,
    value: string | number
  ) =>
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === i ? { ...item, [field]: value } : item
      )
    );

  const toggleService = (id: string) =>
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const totalWeight = items.reduce(
    (sum, item) => sum + Number(item.weight),
    0
  );
  const totalQuantity = items.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  const selectedServiceObjects = services.filter((s) =>
    selectedServices.includes(s.id)
  );
  const avgPricePerKg =
    selectedServiceObjects.length > 0
      ? selectedServiceObjects.reduce((sum, s) => sum + s.price_per_kg, 0) /
        selectedServiceObjects.length
      : 0;
  const totalPrice = totalWeight * avgPricePerKg;

  const validateStep0 = () => {
    if (items.some((item) => !item.cloth_type.trim())) {
      addToast("Please fill in cloth type for all items.", "error");
      return false;
    }
    if (items.some((item) => item.weight <= 0)) {
      addToast("Please enter weight for all items.", "error");
      return false;
    }
    return true;
  };

  const validateStep1 = () => {
    if (selectedServices.length === 0) {
      addToast("Please select at least one service.", "error");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!customer) return;
    setLoading(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from("laundry_orders")
        .insert({
          customer_id: customer.id,
          total_weight: totalWeight,
          total_quantity: totalQuantity,
          total_price: totalPrice,
          status: "collected",
        })
        .select()
        .single();

      if (orderError || !order) throw orderError;

      for (const item of items) {
        const { data: orderItem, error: itemError } = await supabase
          .from("order_items")
          .insert({
            order_id: order.id,
            cloth_type: item.cloth_type,
            quantity: Number(item.quantity),
            weight: Number(item.weight),
            notes: item.notes,
          })
          .select()
          .single();

        if (itemError || !orderItem) throw itemError;

        if (selectedServices.length > 0) {
          const serviceLinks = selectedServices.map((sid) => ({
            order_item_id: orderItem.id,
            service_id: sid,
          }));
          await supabase.from("order_item_services").insert(serviceLinks);
        }
      }

      await supabase.from("payments").insert({
        order_id: order.id,
        amount: totalPrice,
        method: paymentMethod,
        status: "pending",
      });

      await supabase.from("status_history").insert({
        order_id: order.id,
        status: "collected",
        notes: "Order placed by customer",
      });

      await supabase.from("notifications").insert({
        customer_id: customer.id,
        message: `Your order #${order.id.slice(0, 8).toUpperCase()} has been placed and collected. We will start processing shortly.`,
        is_read: false,
      });

      addToast("Order placed successfully!", "success");
      setTimeout(() => navigate(`/orders/${order.id}/track`), 1200);
    } catch (err) {
      addToast("Failed to place order. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const stepState = (i: number) => {
    if (i < step) return "done";
    if (i === step) return "active";
    return "pending";
  };

  return (
    <PageWrapper>
      <PageTitle>Place New Order</PageTitle>

      <StepperBar>
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 && <StepConnector done={i <= step ? true : undefined} />}
            <StepItem>
              <StepCircle state={stepState(i)}>
                {i < step ? (
                  <Icon size="100" label="done">
                    <Check />
                  </Icon>
                ) : (
                  i + 1
                )}
              </StepCircle>
              <StepLabel active={i === step ? true : false}>{label}</StepLabel>
            </StepItem>
          </React.Fragment>
        ))}
      </StepperBar>

      <StepContent>
        {step === 0 && (
          <>
            <StepTitle>Select Your Items</StepTitle>
            {items.map((item, i) => (
              <ItemRow key={i}>
                <InputText
                  label="Cloth Type"
                  id={`cloth-${i}`}
                  name={`cloth-${i}`}
                  value={item.cloth_type}
                  onChange={(e) => updateItem(i, "cloth_type", e.target.value)}
                  placeholder="e.g., Shirts, Jeans"
                />
                <InputText
                  label="Qty"
                  type="number"
                  id={`qty-${i}`}
                  name={`qty-${i}`}
                  value={String(item.quantity)}
                  onChange={(e) =>
                    updateItem(i, "quantity", Number(e.target.value))
                  }
                />
                <InputText
                  label="Weight (kg)"
                  type="number"
                  id={`weight-${i}`}
                  name={`weight-${i}`}
                  value={String(item.weight)}
                  onChange={(e) =>
                    updateItem(i, "weight", Number(e.target.value))
                  }
                />
                <Button
                  variant="secondary"
                  isOutline
                  density="compact"
                  css={{ color: "$error", borderColor: "$error", minWidth: "36px" }}
                  disabled={items.length === 1}
                  onClick={() => removeItem(i)}
                >
                  ✕
                </Button>
              </ItemRow>
            ))}
            <Button
              variant="secondary"
              density="compact"
              onClick={addItem}
              css={{ marginTop: "$075" }}
            >
              + Add Another Item
            </Button>
          </>
        )}

        {step === 1 && (
          <>
            <StepTitle>Choose Services</StepTitle>
            {servicesLoading ? (
              <LoadingSpinner />
            ) : (
              <ServiceGrid>
                {services.map((s) => (
                  <ServiceCard
                    key={s.id}
                    selected={selectedServices.includes(s.id) ? true : false}
                    onClick={() => toggleService(s.id)}
                  >
                    <ServiceName>{s.name}</ServiceName>
                    <ServiceDesc>{s.description}</ServiceDesc>
                    <ServicePrice>${s.price_per_kg}/kg</ServicePrice>
                  </ServiceCard>
                ))}
              </ServiceGrid>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <StepTitle>Confirm & Submit</StepTitle>

            <div style={{ marginBottom: "24px" }}>
              <p
                style={{
                  fontFamily: "var(--wpds-fonts-meta)",
                  fontWeight: "700",
                  fontSize: "var(--wpds-fontSizes-087)",
                  color: "var(--wpds-colors-onBackground-subtle)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                Order Items
              </p>
              {items.map((item, i) => (
                <SummaryRow key={i}>
                  <span>
                    {item.cloth_type} (x{item.quantity})
                  </span>
                  <span>{item.weight}kg</span>
                </SummaryRow>
              ))}
            </div>

            <div style={{ marginBottom: "24px" }}>
              <p
                style={{
                  fontFamily: "var(--wpds-fonts-meta)",
                  fontWeight: "700",
                  fontSize: "var(--wpds-fontSizes-087)",
                  color: "var(--wpds-colors-onBackground-subtle)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                Services
              </p>
              {selectedServiceObjects.map((s) => (
                <SummaryRow key={s.id}>
                  <span>{s.name}</span>
                  <span>${s.price_per_kg}/kg</span>
                </SummaryRow>
              ))}
            </div>

            <div style={{ marginBottom: "24px" }}>
              <p
                style={{
                  fontFamily: "var(--wpds-fonts-meta)",
                  fontWeight: "700",
                  fontSize: "var(--wpds-fontSizes-087)",
                  color: "var(--wpds-colors-onBackground-subtle)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                Payment Method
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {(["cash", "card", "mobile"] as const).map((m) => (
                  <label
                    key={m}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      fontFamily: "var(--wpds-fonts-meta)",
                      fontSize: "var(--wpds-fontSizes-087)",
                      textTransform: "capitalize",
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m}
                      checked={paymentMethod === m}
                      onChange={() => setPaymentMethod(m)}
                    />
                    {m === "cash" ? "💵 Cash" : m === "card" ? "💳 Card" : "📱 Mobile"}
                  </label>
                ))}
              </div>
            </div>

            <TotalRow>
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </TotalRow>
            <p
              style={{
                fontFamily: "var(--wpds-fonts-meta)",
                fontSize: "var(--wpds-fontSizes-075)",
                color: "var(--wpds-colors-onBackground-subtle)",
                marginTop: "4px",
              }}
            >
              {totalWeight}kg × avg ${avgPricePerKg.toFixed(2)}/kg
            </p>
          </>
        )}

        <BtnRow>
          <Button
            variant="secondary"
            isOutline
            onClick={() => (step === 0 ? navigate("/dashboard") : setStep((s) => s - 1))}
          >
            {step === 0 ? "Cancel" : "← Back"}
          </Button>
          {step < 2 ? (
            <Button variant="cta" onClick={nextStep}>
              Next →
            </Button>
          ) : (
            <Button
              variant="cta"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Confirm Order"}
            </Button>
          )}
        </BtnRow>
      </StepContent>

      <Toast toasts={toasts} onRemove={removeToast} />
    </PageWrapper>
  );
}
