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
  maxWidth: "440px",
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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast("Please fill in all fields.", "error");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      addToast(error.message || "Invalid credentials. Please try again.", "error");
    } else {
      addToast("Welcome back!", "success");
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
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to manage your laundry orders</Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputText
            label="Email Address"
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputText
            label="Password"
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="cta"
            css={{ width: "100%", justifyContent: "center" }}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </Form>

        <Divider>
          Don't have an account? <Link to="/register">Register here</Link>
        </Divider>
      </Card>
      <Toast toasts={toasts} onRemove={removeToast} />
    </PageWrapper>
  );
}
