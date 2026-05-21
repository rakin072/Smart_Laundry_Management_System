import { styled, keyframes } from "@washingtonpost/wpds-ui-kit";

const spin = keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

const Spinner = styled("div", {
  width: "40px",
  height: "40px",
  border: "3px solid $subtle",
  borderTopColor: "$teal100",
  borderRadius: "$round",
  animation: `${spin} 0.8s linear infinite`,
  variants: {
    size: {
      sm: { width: "20px", height: "20px", borderWidth: "2px" },
      md: { width: "40px", height: "40px" },
      lg: { width: "64px", height: "64px", borderWidth: "4px" },
    },
  },
  defaultVariants: { size: "md" },
});

const Wrapper = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "$300",
});

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

export default function LoadingSpinner({
  size = "md",
  fullPage,
}: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <Wrapper css={{ minHeight: "60vh" }}>
        <Spinner size={size} />
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <Spinner size={size} />
    </Wrapper>
  );
}
