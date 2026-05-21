import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@washingtonpost/wpds-ui-kit";
import { Button } from "@washingtonpost/wpds-ui-kit";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { LaundryOrder, OrderStatus } from "../lib/supabase";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";

const PageWrapper = styled("div", {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "$200 $150",
  "@sm": { padding: "$150 $100" },
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
  marginBottom: "$150",
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
      true: {
        backgroundColor: "$teal100",
        borderColor: "$teal100",
        color: "white",
      },
      false: {
        backgroundColor: "$surface",
        borderColor: "$subtle",
        color: "$onBackground",
        "@hover": {
          "&:hover": { borderColor: "$teal100", color: "$teal100" },
        },
      },
    },
  },
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
  "@hover": {
    "&:hover": { backgroundColor: "$teal600" },
  },
});

const ActionBtn = styled("button", {
  background: "none",
  border: "none",
  color: "$teal100",
  fontFamily: "$meta",
  fontSize: "$075",
  fontWeight: "$bold",
  cursor: "pointer",
  padding: "$025 $050",
  borderRadius: "$025",
  "&:hover": { backgroundColor: "$teal600" },
  marginRight: "$050",
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

const EmptyState = styled("div", {
  textAlign: "center",
  padding: "$300",
  color: "$onBackground-subtle",
  fontFamily: "$meta",
});

const STATUS_FILTERS: Array<{ label: string; value: string }> = [
  { label: "All", value: "all" },
  { label: "Collected", value: "collected" },
  { label: "Washing", value: "washing" },
  { label: "Drying", value: "drying" },
  { label: "Ironing", value: "ironing" },
  { label: "Ready", value: "ready" },
  { label: "Delivered", value: "delivered" },
];

const PAGE_SIZE = 10;

export default function OrderHistory() {
  const { customer, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (authLoading) return;
    if (!customer) { setLoading(false); return; }
    setLoading(true);
    supabase
      .from("laundry_orders")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders(data ?? []);
        setLoading(false);
      });
  }, [customer, authLoading]);

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.status.includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>Order History</PageTitle>
        <Button variant="cta" onClick={() => navigate("/orders/new")}>
          + New Order
        </Button>
      </PageHeader>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <FilterRow>
          {STATUS_FILTERS.map((f) => (
            <FilterBtn
              key={f.value}
              active={statusFilter === f.value ? true : false}
              onClick={() => {
                setStatusFilter(f.value);
                setPage(1);
              }}
            >
              {f.label}
            </FilterBtn>
          ))}
        </FilterRow>
        <SearchInput
          placeholder="Search by order ID..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {paginated.length === 0 ? (
        <EmptyState>
          {orders.length === 0
            ? "No orders yet. Place your first order!"
            : "No orders match your filter."}
        </EmptyState>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <Table>
            <thead>
              <tr>
                <Th>Order ID</Th>
                <Th>Date</Th>
                <Th>Items</Th>
                <Th>Weight</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((order) => (
                <Tr key={order.id}>
                  <Td>
                    <strong>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </strong>
                  </Td>
                  <Td>
                    {new Date(order.created_at).toLocaleDateString()}
                  </Td>
                  <Td>{order.total_quantity}</Td>
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
                    <ActionBtn
                      onClick={() =>
                        navigate(`/orders/${order.id}/track`)
                      }
                    >
                      Track
                    </ActionBtn>
                    <ActionBtn
                      onClick={() =>
                        navigate(`/orders/${order.id}/payment`)
                      }
                    >
                      Payment
                    </ActionBtn>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination>
          <Button
            variant="secondary"
            density="compact"
            isOutline
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            density="compact"
            isOutline
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </Pagination>
      )}
    </PageWrapper>
  );
}
