import { styled } from "@washingtonpost/wpds-ui-kit";
import type { OrderStatus } from "../lib/supabase";

const Badge = styled("span", {
  display: "inline-block",
  padding: "$025 $075",
  borderRadius: "$round",
  fontFamily: "$meta",
  fontSize: "$075",
  fontWeight: "$bold",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  variants: {
    status: {
      collected: {
        backgroundColor: "$gray300",
        color: "$gray60",
      },
      washing: {
        backgroundColor: "$blue600",
        color: "$blue100",
      },
      drying: {
        backgroundColor: "$orange600",
        color: "$orange100",
      },
      ironing: {
        backgroundColor: "$pink600",
        color: "$pink100",
      },
      ready: {
        backgroundColor: "$green600",
        color: "$green100",
      },
      delivered: {
        backgroundColor: "$teal600",
        color: "$teal100",
      },
    },
  },
});

const STATUS_LABELS: Record<OrderStatus, string> = {
  collected: "Collected",
  washing: "Washing",
  drying: "Drying",
  ironing: "Ironing",
  ready: "Ready",
  delivered: "Delivered",
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge status={status}>{STATUS_LABELS[status]}</Badge>;
}
