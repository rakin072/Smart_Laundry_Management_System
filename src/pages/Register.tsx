import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { styled } from "@washingtonpost/wpds-ui-kit";
import { Button, InputText } from "@washingtonpost/wpds-ui-kit";
import { useAuth } from "../context/AuthContext";
import { Toast, useToast } from "../components/Toast";

const PageWrapper = styled("div", {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "$background-forSurfaces",
  padding: "$150",
});

const Card = styled("div", {
  backgroundColor: "$surface",
  border: "1px solid $subtle",
  borderRadius: "$075",
  padding: "$300",
  width: "100%",
  maxWidth: "480px",
  boxShadow: "$300",
});

const Logo = styled("div", {
  textAlign: "center",
  marginBottom: "$200",
});

const LogoText = styled("h1", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$200",
  color: "$primary",
  "& span": { color: "$teal100" },
});

const Title = styled("h2", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$175",
  color: "$primary",
  marginBottom: "$050",
});

const Subtitle = styled("p", {
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground-subtle",
  marginBottom: "$200",
});

const Form = styled("form", {
  display: "flex",
  flexDirection: "column",
  gap: "$125",
});

const Divider = styled("div", {
  textAlign: "center",
  marginTop: "$150",
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground-subtle",
  "& a": {
    color: "$teal100",
    fontWeight: "$bold",
    textDecoration: "none",
    "&:hover": { textDecoration: "underline" },
  },
});

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      addToast("Please fill in all required fields.", "error");
      return;
    }
    if (form.password.length < 6) {
      addToast("Password must be at least 6 characters.", "error");
      return;
    }
    if (form.password !== form.confirmPassword) {
      addToast("Passwords do not match.", "error");
      return;
    }
    setLoading(true);
    const { error } = await signUp(
      form.email,
      form.password,
      form.name,
      form.phone,
      form.address
    );
    setLoading(false);
    if (error) {
      addToast(error.message || "Registration failed. Please try again.", "error");
    } else {
      addToast("Account created! Welcome to FreshWash.", "success");
      navigate("/dashboard");
    }
  };

  return (
    <PageWrapper>
      <Card>
        <Logo>
          <LogoText>
            Fresh<span>Wash</span>
          </LogoText>
        </Logo>
        <Title>Create Account</Title>
        <Subtitle>Join FreshWash and enjoy hassle-free laundry</Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputText
            label="Full Name"
            id="name"
            name="name"
            value={form.name}
            onChange={set("name")}
            required
          />
          <InputText
            label="Email Address"
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={set("email")}
            required
          />
          <InputText
            label="Phone Number"
            type="tel"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={set("phone")}
          />
          <InputText
            label="Address"
            id="address"
            name="address"
            value={form.address}
            onChange={set("address")}
          />
          <InputText
            label="Password"
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={set("password")}
            helperText="At least 6 characters"
            required
          />
          <InputText
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            required
          />
          <Button
            type="submit"
            variant="cta"
            css={{ width: "100%", justifyContent: "center" }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </Form>

        <Divider>
          Already have an account? <Link to="/login">Sign in</Link>
        </Divider>
      </Card>
      <Toast toasts={toasts} onRemove={removeToast} />
    </PageWrapper>
  );
}
