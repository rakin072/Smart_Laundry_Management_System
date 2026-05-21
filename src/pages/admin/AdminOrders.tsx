import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@washingtonpost/wpds-ui-kit";
import { Button } from "@washingtonpost/wpds-ui-kit";
import { supabase } from "../../lib/supabase";
import type { LaundryOrder, OrderStatus } from "../../lib/supabase";
import StatusBadge from "../../components/StatusBadge";
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
  transition: "all 0.15s",
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

const SearchInput = styled("input", {
  border: "1px solid $subtle",
  borderRadius: "$050",
  padding: "$075 $100",
  fontFamily: "$meta",
  fontSize: "$087",
  backgroundColor: "$surface",
  color: "$onBackground",
  outline: "none",
  width: "220px",
  "&:focus": { borderColor: "$teal100" },
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

const Checkbox = styled("input", {
  cursor: "pointer",
  width: "16px",
  height: "16px",
});

const BulkBar = styled("div", {
  display: "flex",
  gap: "$100",
  alignItems: "center",
  padding: "$100 $125",
  backgroundColor: "$blue600",
  borderRadius: "$050",
  marginBottom: "$100",
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$blue100",
});

const STATUS_OPTIONS: OrderStatus[] = [
  "collected",
  "washing",
  "drying",
  "ironing",
  "ready",
  "delivered",
];

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

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<(LaundryOrder & { customers?: { name: string; email: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("washing");
  const [page, setPage] = useState(1);
  const { toasts, addToast, removeToast } = useToast();

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("laundry_orders")
      .select("*, customers(name, email)")
      .order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: OrderStatus, customerIdForNotif: string) => {
    const { error } = await supabase
      .from("laundry_orders")
      .update({ status })
      .eq("id", id);
    if (error) { addToast("Failed to update status", "error"); return; }

    await supabase.from("status_history").insert({
      order_id: id,
      status,
      notes: `Status updated by admin`,
    });

    await supabase.from("notifications").insert({
      customer_id: customerIdForNotif,
      message: `Your order #${id.slice(0, 8).toUpperCase()} status has been updated to "${status.charAt(0).toUpperCase() + status.slice(1)}".`,
      is_read: false,
    });

    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    addToast("Order status updated", "success");
  };

  const bulkUpdate = async () => {
    if (selected.length === 0) { addToast("Select at least one order", "error"); return; }
    for (const id of selected) {
      const order = orders.find((o) => o.id === id);
      if (order) await updateStatus(id, bulkStatus, order.customer_id);
    }
    setSelected([]);
    addToast(`${selected.length} orders updated`, "success");
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.customers?.name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <PageWrapper>
      <AdminNav>
        <AdminNavBtn onClick={() => navigate("/admin-panel")}>Dashboard</AdminNavBtn>
        <AdminNavBtn active>Orders</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/customers")}>Customers</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/services")}>Services</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/payments")}>Payments</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/reports")}>Reports</AdminNavBtn>
      </AdminNav>

      <PageHeader>
        <PageTitle>Manage Orders</PageTitle>
        <span style={{ fontFamily: "var(--wpds-fonts-meta)", fontSize: "var(--wpds-fontSizes-087)", color: "var(--wpds-colors-onBackground-subtle)" }}>
          {filtered.length} orders
        </span>
      </PageHeader>

      <FilterRow>
        <SearchInput
          placeholder="Search by ID or customer..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }}
        />
        {["all", ...STATUS_OPTIONS].map((s) => (
          <FilterBtn
            key={s}
            active={statusFilter === s ? true : false}
            onClick={() => { setStatusFilter(s); setPage(1); }}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </FilterBtn>
        ))}
      </FilterRow>

      {selected.length > 0 && (
        <BulkBar>
          <span>{selected.length} selected</span>
          <StatusSelect
            value={bulkStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBulkStatus(e.target.value as OrderStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </StatusSelect>
          <Button variant="cta" density="compact" onClick={bulkUpdate}>
            Update {selected.length} Orders
          </Button>
          <Button
            variant="secondary"
            density="compact"
            isOutline
            onClick={() => setSelected([])}
          >
            Clear
          </Button>
        </BulkBar>
      )}

      <div style={{ overflowX: "auto" }}>
        <Table>
          <thead>
            <tr>
              <Th style={{ width: "40px" }}>
                <Checkbox
                  type="checkbox"
                  checked={selected.length === paginated.length && paginated.length > 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSelected(e.target.checked ? paginated.map((o) => o.id) : [])
                  }
                />
              </Th>
              <Th>Order ID</Th>
              <Th>Customer</Th>
              <Th>Date</Th>
              <Th>Weight</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Update Status</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((order) => (
              <Tr key={order.id}>
                <Td>
                  <Checkbox
                    type="checkbox"
                    checked={selected.includes(order.id)}
                    onChange={() => toggleSelect(order.id)}
                  />
                </Td>
                <Td>#{order.id.slice(0, 8).toUpperCase()}</Td>
                <Td>{order.customers?.name ?? "—"}</Td>
                <Td>{new Date(order.created_at).toLocaleDateString()}</Td>
                <Td>{order.total_weight}kg</Td>
                <Td>
                  <strong style={{ color: "var(--wpds-colors-teal100)" }}>
                    ${order.total_price.toFixed(2)}
                  </strong>
                </Td>
                <Td>
                  <StatusBadge status={order.status} />
                </Td>
                <Td>
                  <StatusSelect
                    value={order.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      updateStatus(order.id, e.target.value as OrderStatus, order.customer_id)
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
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
