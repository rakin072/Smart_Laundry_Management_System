import { useEffect, useState } from "react";
import { styled, keyframes } from "@washingtonpost/wpds-ui-kit";

const slideIn = keyframes({
  from: { transform: "translateX(100%)", opacity: 0 },
  to: { transform: "translateX(0)", opacity: 1 },
});

const slideOut = keyframes({
  from: { transform: "translateX(0)", opacity: 1 },
  to: { transform: "translateX(100%)", opacity: 0 },
});

const ToastContainer = styled("div", {
  position: "fixed",
  bottom: "$150",
  right: "$150",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  gap: "$075",
});

const ToastItem = styled("div", {
  padding: "$100 $150",
  borderRadius: "$050",
  boxShadow: "$400",
  fontFamily: "$meta",
  fontSize: "$087",
  minWidth: "280px",
  maxWidth: "400px",
  animation: `${slideIn} 0.3s ease`,
  variants: {
    type: {
      success: {
        backgroundColor: "$green100",
        color: "white",
      },
      error: {
        backgroundColor: "$error",
        color: "white",
      },
      info: {
        backgroundColor: "$blue100",
        color: "white",
      },
    },
    exiting: {
      true: {
        animation: `${slideOut} 0.3s ease forwards`,
      },
    },
  },
});

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <ToastContainer>
      {toasts.map((t) => (
        <ToastItemComponent key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </ToastContainer>
  );
}

function ToastItemComponent({
  toast,
  onRemove,
}: {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <ToastItem type={toast.type} exiting={exiting ? true : undefined}>
      {toast.message}
    </ToastItem>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}
