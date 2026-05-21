import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@washingtonpost/wpds-ui-kit";
import { Button, InputText } from "@washingtonpost/wpds-ui-kit";
import { supabase } from "../../lib/supabase";
import type { Service } from "../../lib/supabase";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Toast, useToast } from "../../components/Toast";

const PageWrapper = styled("div", {
  maxWidth: "1000px",
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

const Grid = styled("div", {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: "$200",
  "@md": { gridTemplateColumns: "1fr" },
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

const FormCard = styled("div", {
  backgroundColor: "$surface",
  border: "1px solid $subtle",
  borderRadius: "$075",
  padding: "$200",
  boxShadow: "$100",
  position: "sticky",
  top: "80px",
});

const FormTitle = styled("h2", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$150",
  color: "$primary",
  marginBottom: "$150",
});

const Form = styled("form", {
  display: "flex",
  flexDirection: "column",
  gap: "$125",
});

const ActiveBadge = styled("span", {
  display: "inline-block",
  padding: "$025 $075",
  borderRadius: "$round",
  fontFamily: "$meta",
  fontSize: "$075",
  fontWeight: "$bold",
  variants: {
    active: {
      true: { backgroundColor: "$green600", color: "$green100" },
      false: { backgroundColor: "$gray300", color: "$gray60" },
    },
  },
});

const ActionBtn = styled("button", {
  background: "none",
  border: "none",
  fontFamily: "$meta",
  fontSize: "$075",
  fontWeight: "$bold",
  cursor: "pointer",
  padding: "$025 $050",
  borderRadius: "$025",
  marginRight: "$025",
});

interface ServiceForm {
  name: string;
  description: string;
  price_per_kg: string;
  is_active: boolean;
}

const defaultForm: ServiceForm = {
  name: "",
  description: "",
  price_per_kg: "",
  is_active: true,
};

export default function AdminServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ServiceForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const fetchServices = async () => {
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });
    setServices(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price_per_kg) {
      addToast("Name and price are required.", "error");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price_per_kg: parseFloat(form.price_per_kg),
      is_active: form.is_active,
    };

    if (editingId) {
      const { error } = await supabase
        .from("services")
        .update(payload)
        .eq("id", editingId);
      if (error) { addToast("Failed to update", "error"); }
      else { addToast("Service updated!", "success"); }
    } else {
      const { error } = await supabase.from("services").insert(payload);
      if (error) { addToast("Failed to create", "error"); }
      else { addToast("Service created!", "success"); }
    }

    setForm(defaultForm);
    setEditingId(null);
    setSaving(false);
    fetchServices();
  };

  const handleEdit = (s: Service) => {
    setForm({
      name: s.name,
      description: s.description,
      price_per_kg: String(s.price_per_kg),
      is_active: s.is_active,
    });
    setEditingId(s.id);
  };

  const handleToggle = async (s: Service) => {
    await supabase
      .from("services")
      .update({ is_active: !s.is_active })
      .eq("id", s.id);
    fetchServices();
    addToast(`Service ${s.is_active ? "deactivated" : "activated"}`, "info");
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <PageWrapper>
      <AdminNav>
        <AdminNavBtn onClick={() => navigate("/admin-panel")}>Dashboard</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/orders")}>Orders</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/customers")}>Customers</AdminNavBtn>
        <AdminNavBtn active>Services</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/payments")}>Payments</AdminNavBtn>
        <AdminNavBtn onClick={() => navigate("/admin-panel/reports")}>Reports</AdminNavBtn>
      </AdminNav>

      <PageHeader>
        <PageTitle>Manage Services</PageTitle>
      </PageHeader>

      <Grid>
        <div>
          <Table>
            <thead>
              <tr>
                <Th>Service</Th>
                <Th>Price/kg</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <Tr key={s.id}>
                  <Td>
                    <strong>{s.name}</strong>
                    <span style={{ display: "block", fontSize: "var(--wpds-fontSizes-075)", color: "var(--wpds-colors-onBackground-subtle)" }}>
                      {s.description}
                    </span>
                  </Td>
                  <Td>
                    <strong style={{ color: "var(--wpds-colors-teal100)" }}>
                      ${s.price_per_kg}
                    </strong>
                  </Td>
                  <Td>
                    <ActiveBadge active={s.is_active ? true : false}>
                      {s.is_active ? "Active" : "Inactive"}
                    </ActiveBadge>
                  </Td>
                  <Td>
                    <ActionBtn
                      style={{ color: "var(--wpds-colors-blue100)" }}
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </ActionBtn>
                    <ActionBtn
                      style={{ color: s.is_active ? "var(--wpds-colors-error)" : "var(--wpds-colors-green100)" }}
                      onClick={() => handleToggle(s)}
                    >
                      {s.is_active ? "Deactivate" : "Activate"}
                    </ActionBtn>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>

        <FormCard>
          <FormTitle>{editingId ? "Edit Service" : "Add Service"}</FormTitle>
          <Form onSubmit={handleSubmit}>
            <InputText
              label="Service Name"
              id="svc-name"
              name="svc-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <InputText
              label="Description"
              id="svc-desc"
              name="svc-desc"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            <InputText
              label="Price per kg ($)"
              type="number"
              id="svc-price"
              name="svc-price"
              value={form.price_per_kg}
              onChange={(e) => setForm((p) => ({ ...p, price_per_kg: e.target.value }))}
              required
            />
            <label style={{ display: "flex", gap: "8px", alignItems: "center", fontFamily: "var(--wpds-fonts-meta)", fontSize: "var(--wpds-fontSizes-087)" }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
              />
              Active
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button type="submit" variant="cta" density="compact" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Add Service"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="secondary"
                  density="compact"
                  isOutline
                  onClick={() => { setForm(defaultForm); setEditingId(null); }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </Form>
        </FormCard>
      </Grid>

      <Toast toasts={toasts} onRemove={removeToast} />
    </PageWrapper>
  );
}
