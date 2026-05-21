import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@washingtonpost/wpds-ui-kit";
import { Button } from "@washingtonpost/wpds-ui-kit";
import { supabase } from "../../lib/supabase";
import type { Payment, PaymentMethod, PaymentStatus } from "../../lib/supabase";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Toast, useToast } from "../../components/Toast";

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

const FilterRow = styled("div", {
  display: "flex",
  gap: "$075",
  flexWrap: "wrap",
  marginBottom: "$125",
  alignItems: "center",
});

const FilterBtn = styled("button", {
  border: "1px solid",
  borderRadius: "$round",
  padding: "$025 $100",
  fontFamily: "$meta",
  fontSize: "$075",
  cursor: "pointer",
  transition: "all 0.15s",
  variants: {
    active: {
      true: { backgroundColor: "$teal100", borderColor: "$teal100", color: "white" },
      false: { backgroundColor: "$surface", borderColor: "$subtle", color: "$onBackground" },
    },
  },
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
  verticalAlign: "middle",
});

const Tr = styled("tr", {
  transition: "background 0.15s",
  "@hover": { "&:hover": { backgroundColor: "$teal600" } },
});

const PayBadge = styled("span", {
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

const StatusSelect = styled("select", {
  border: "1px solid $subtle",
  borderRadius: "$025",
  padding: "$025 $050",
  fontFamily: "$meta",
  fontSize: "$075",
  cursor: "pointer",
  backgroundColor: "$surface",
  color: "$onBackground",
  "&:focus": { borderColor: "$teal100", outline: "none" },
});

const Pagination = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "$100",
  marginTop: "$150",
  fontFamily: "$meta",
  fontSize: "$087",
});

const PAGE_SIZE = 15;

export default function AdminPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<(Payment & { laundry_orders?: { customer_id: string; customers?: { name: string } } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const { toasts, addToast, removeToast } = useToast();

  const fetchPayments = async () => {
    const { data } = await supabase
      .from("payments")
      .select("*, laundry_orders(customer_id, customers(name))")
      .order("created_at", { ascending: false });
    setPayments(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const updateStatus = async (id: string, status: PaymentStatus) => {
    const { error } = await supabase
      .from("payments")
      .update({
        status,
        payment_date: status === "paid" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (error) { addToast("Failed to update", "error"); return; }
    setPayments((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
    addToast("Payment status updated", "success");
  };

  const filtered = payments.filter((p) => {
    const matchMethod = methodFilter === "all" || p.method === methodFilter;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchMethod && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <PageWrapper>
      <AdminNav>
        <AdminNavBtn onClick={() => navigate("/admin-panel")}>Dashboard</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/orders")}>Orders</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/customers")}>Customers</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/services")}>Services</AdminNavBtn>
        <AdminNavBtn active>Payments</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/reports")}>Reports</AdminNavBtn>
      </AdminNav>

      <PageHeader>
        <PageTitle>Manage Payments</PageTitle>
        <div style={{ display: "flex", gap: "16px", fontFamily: "var(--wpds-fonts-meta)", fontSize: "var(--wpds-fontSizes-087)" }}>
          <span style={{ color: "var(--wpds-colors-green100)", fontWeight: "700" }}>
            Collected: ${totalRevenue.toFixed(2)}
          </span>
          <span style={{ color: "var(--wpds-colors-mustard100)", fontWeight: "700" }}>
            Pending: ${pendingRevenue.toFixed(2)}
          </span>
        </div>
      </PageHeader>

      <FilterRow>
        <span style={{ fontFamily: "var(--wpds-fonts-meta)", fontSize: "var(--wpds-fontSizes-075)", color: "var(--wpds-colors-onBackground-subtle)" }}>
          Method:
        </span>
        {["all", "cash", "card", "mobile"].map((m) => (
          <FilterBtn
            key={m}
            active={methodFilter === m ? true : false}
            onClick={() => { setMethodFilter(m); setPage(1); }}
          >
            {m === "all" ? "All" : m.charAt(0).toUpperCase() + m.slice(1)}
          </FilterBtn>
        ))}
        <span style={{ marginLeft: "16px", fontFamily: "var(--wpds-fonts-meta)", fontSize: "var(--wpds-fontSizes-075)", color: "var(--wpds-colors-onBackground-subtle)" }}>
          Status:
        </span>
        {["all", "pending", "paid", "failed"].map((s) => (
          <FilterBtn
            key={s}
            active={statusFilter === s ? true : false}
            onClick={() => { setStatusFilter(s); setPage(1); }}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </FilterBtn>
        ))}
      </FilterRow>

      <div style={{ overflowX: "auto" }}>
        <Table>
          <thead>
            <tr>
              <Th>Payment ID</Th>
              <Th>Order ID</Th>
              <Th>Customer</Th>
              <Th>Amount</Th>
              <Th>Method</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th>Update</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => (
              <Tr key={p.id}>
                <Td>#{p.id.slice(0, 8).toUpperCase()}</Td>
                <Td>#{p.order_id.slice(0, 8).toUpperCase()}</Td>
                <Td>{(p.laundry_orders as any)?.customers?.name ?? "—"}</Td>
                <Td>
                  <strong style={{ color: "var(--wpds-colors-teal100)" }}>
                    ${p.amount.toFixed(2)}
                  </strong>
                </Td>
                <Td style={{ textTransform: "capitalize" }}>
                  {p.method === "cash" ? "💵 Cash" : p.method === "card" ? "💳 Card" : "📱 Mobile"}
                </Td>
                <Td>
                  <PayBadge status={p.status}>{p.status}</PayBadge>
                </Td>
                <Td>
                  {p.payment_date
                    ? new Date(p.payment_date).toLocaleDateString()
                    : new Date(p.created_at).toLocaleDateString()}
                </Td>
                <Td>
                  <StatusSelect
                    value={p.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateStatus(p.id, e.target.value as PaymentStatus)}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </StatusSelect>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <Button variant="secondary" density="compact" isOutline disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</Button>
          <span>Page {page} of {totalPages}</span>
          <Button variant="secondary" density="compact" isOutline disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</Button>
        </Pagination>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </PageWrapper>
  );
}
