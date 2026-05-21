import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@washingtonpost/wpds-ui-kit";
import { supabase } from "../../lib/supabase";
import type { Customer } from "../../lib/supabase";
import LoadingSpinner from "../../components/LoadingSpinner";

const PageWrapper = styled("div", {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "$200 $150",
  "@sm": { padding: "$150 $100" },
});

const AdminNav = styled("div", {
  display: "flex",
  gap: "$075",
  marginBottom: "$200",
  flexWrap: "wrap",
});

const AdminNavBtn = styled("button", {
  border: "1px solid $subtle",
  borderRadius: "$050",
  padding: "$075 $125",
  fontFamily: "$meta",
  fontSize: "$087",
  cursor: "pointer",
  backgroundColor: "$surface",
  color: "$onBackground",
  "&:hover": { borderColor: "$teal100", color: "$teal100" },
  variants: {
    active: {
      true: { backgroundColor: "$teal100", color: "white", borderColor: "$teal100" },
    },
  },
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

const SearchInput = styled("input", {
  border: "1px solid $subtle",
  borderRadius: "$050",
  padding: "$075 $100",
  fontFamily: "$meta",
  fontSize: "$087",
  backgroundColor: "$surface",
  color: "$onBackground",
  outline: "none",
  width: "260px",
  marginBottom: "$125",
  "&:focus": { borderColor: "$teal100" },
  "@sm": { width: "100%" },
});

const Table = styled("table", {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "$surface",
  border: "1px solid $subtle",
  borderRadius: "$075",
  overflow: "hidden",
  boxShadow: "$100",
});

const Th = styled("th", {
  padding: "$100 $125",
  textAlign: "left",
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$075",
  color: "$onBackground-subtle",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  backgroundColor: "$background-forSurfaces",
  borderBottom: "1px solid $subtle",
});

const Td = styled("td", {
  padding: "$100 $125",
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground",
  borderBottom: "1px solid $subtle",
});

const Tr = styled("tr", {
  transition: "background 0.15s",
  "@hover": { "&:hover": { backgroundColor: "$teal600" } },
});

const Avatar = styled("div", {
  width: "36px",
  height: "36px",
  borderRadius: "$round",
  backgroundColor: "$teal100",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$087",
});

const AdminBadge = styled("span", {
  display: "inline-block",
  padding: "$025 $075",
  borderRadius: "$round",
  fontFamily: "$meta",
  fontSize: "$075",
  fontWeight: "$bold",
  backgroundColor: "$blue600",
  color: "$blue100",
});

export default function AdminCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<(Customer & { order_count?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      setCustomers(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <PageWrapper>
      <AdminNav>
        <AdminNavBtn onClick={() => navigate("/admin-panel")}>Dashboard</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/orders")}>Orders</AdminNavBtn>
        <AdminNavBtn active>Customers</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/services")}>Services</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/payments")}>Payments</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/reports")}>Reports</AdminNavBtn>
      </AdminNav>

      <PageHeader>
        <PageTitle>Manage Customers</PageTitle>
        <span style={{ fontFamily: "var(--wpds-fonts-meta)", fontSize: "var(--wpds-fontSizes-087)", color: "var(--wpds-colors-onBackground-subtle)" }}>
          {filtered.length} customers
        </span>
      </PageHeader>

      <SearchInput
        placeholder="Search by name, email, or phone..."
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
      />

      <div style={{ overflowX: "auto" }}>
        <Table>
          <thead>
            <tr>
              <Th>Customer</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Address</Th>
              <Th>Role</Th>
              <Th>Joined</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <Tr key={c.id}>
                <Td>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Avatar>
                      {c.name ? c.name[0].toUpperCase() : "?"}
                    </Avatar>
                    <span style={{ fontWeight: "700" }}>{c.name || "—"}</span>
                  </div>
                </Td>
                <Td>{c.email}</Td>
                <Td>{c.phone || "—"}</Td>
                <Td>{c.address || "—"}</Td>
                <Td>
                  {c.is_admin ? (
                    <AdminBadge>Admin</AdminBadge>
                  ) : (
                    <span style={{ color: "var(--wpds-colors-onBackground-subtle)" }}>Customer</span>
                  )}
                </Td>
                <Td>{new Date(c.created_at).toLocaleDateString()}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </PageWrapper>
  );
}
