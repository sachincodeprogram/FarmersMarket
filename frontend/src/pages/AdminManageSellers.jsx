import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API;

const CITIES = [
  "Delhi","Mumbai","Kolkata","Chennai","Bangalore",
  "Hyderabad","Pune","Ahmedabad","Jaipur","Lucknow","Noida","Gurgaon"
];

export default function AdminManageSellers() {

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [toast, setToast]         = useState("");
  const [toastOk, setToastOk]     = useState(true);
  const [formUid, setFormUid]     = useState("");       // which user's form is open
  const [formCity, setFormCity]   = useState("");
  const [formType, setFormType]   = useState("city_seller");
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setError("");
      const res = await axios.get(`${API}/api/users`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError("❌ Users load nahi hue: " + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  }

  function openForm(uid, city = "", type = "city_seller") {
    setFormUid(uid);
    setFormCity(city);
    setFormType(type);
  }

  function closeForm() {
    setFormUid("");
    setFormCity("");
    setFormType("city_seller");
  }

  function flash(msg, ok = true) {
    setToast(msg);
    setToastOk(ok);
    setTimeout(() => setToast(""), 3500);
  }

  async function handleSave() {
    if (!formCity) {
      flash("❌ Pehle city chuniye", false);
      return;
    }
    try {
      setSaving(true);
      const res = await axios.post(`${API}/api/users/assign-seller`, {
        uid: formUid,
        location: formCity,
        sellerType: formType
      });
      flash("✅ " + res.data.message, true);
      closeForm();
      // silent refresh (no loading screen)
      const r2 = await axios.get(`${API}/api/users`);
      setUsers(Array.isArray(r2.data) ? r2.data : []);
    } catch (e) {
      flash("❌ " + (e.response?.data?.error || e.message), false);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(uid, name) {
    if (!window.confirm(`${name} ko seller se hatana chahte ho?`)) return;
    try {
      setSaving(true);
      await axios.post(`${API}/api/users/remove-seller`, { uid });
      flash("✅ Seller remove ho gaya", true);
      const r2 = await axios.get(`${API}/api/users`);
      setUsers(Array.isArray(r2.data) ? r2.data : []);
    } catch (e) {
      flash("❌ " + (e.response?.data?.error || e.message), false);
    } finally {
      setSaving(false);
    }
  }

  const q = search.toLowerCase();
  const filtered    = users.filter(u =>
    (u.name || "").toLowerCase().includes(q) || (u.phone || "").includes(q)
  );
  const thokSellers = filtered.filter(u => u.role === "seller" && u.sellerType === "thok_seller");
  const citySellers = filtered.filter(u => u.role === "seller" && (!u.sellerType || u.sellerType === "city_seller"));
  const normalUsers = filtered.filter(u => u.role !== "seller" && u.role !== "admin");

  if (loading) return (
    <div style={{ padding: 60, textAlign: "center", color: "#666" }}>
      ⏳ Load ho raha hai...
    </div>
  );

  if (error) return (
    <div style={{ padding: 40, textAlign: "center", color: "#dc2626", background: "#fef2f2", margin: 20, borderRadius: 12 }}>
      {error}<br />
      <button onClick={fetchUsers} style={{ marginTop: 12, padding: "8px 20px", cursor: "pointer" }}>
        Dobara Try Karo
      </button>
    </div>
  );

  return (
    <div style={{ padding: 20, background: "#f3f4f6", minHeight: "100vh" }}>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "14px 22px", borderRadius: 12, fontWeight: 700, fontSize: 14,
          background: toastOk ? "#f0fdf4" : "#fef2f2",
          color:      toastOk ? "#16a34a" : "#dc2626",
          border:     `1px solid ${toastOk ? "#c6e8c6" : "#fecaca"}`,
          boxShadow:  "0 4px 20px rgba(0,0,0,.15)"
        }}>
          {toast}
        </div>
      )}

      <h2 style={{ margin: "0 0 20px", fontSize: 22, color: "#15803d" }}>
        👥 Sellers Manage Karo
      </h2>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total Users",  val: users.length,         color: "#3b82f6" },
          { label: "City Sellers", val: citySellers.length,   color: "#16a34a" },
          { label: "Thok Mandi",   val: thokSellers.length,   color: "#f97316" },
          { label: "Normal Users", val: normalUsers.length,   color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", padding: "14px 18px", borderRadius: 12, borderTop: `4px solid ${s.color}`, boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
            <p style={{ color: "#666", fontSize: 13, margin: 0 }}>{s.label}</p>
            <h2 style={{ margin: "4px 0 0", color: s.color }}>{s.val}</h2>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <input
        style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #d1d5db", fontSize: 15, marginBottom: 24, boxSizing: "border-box" }}
        placeholder="🔍 Naam ya phone se dhundho..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* THOK MANDI */}
      <Section title={`🏭 Thok Mandi Sellers (${thokSellers.length})`} empty="Koi Thok Mandi Seller nahi">
        {thokSellers.map(u => (
          <Row key={u._id} u={u}
            badge={<Badge bg="#fff7ed" border="#f97316" color="#c2410c">🏭 Thok — 📍 {u.location || "—"}</Badge>}
            formOpen={formUid === u.uid}
            formCity={formCity} formType={formType}
            saving={saving}
            onOpenForm={() => openForm(u.uid, u.location || "", u.sellerType || "thok_seller")}
            onCloseForm={closeForm}
            onCityChange={setFormCity}
            onTypeChange={setFormType}
            onSave={handleSave}
            onRemove={() => handleRemove(u.uid, u.name)}
            editLabel="🔄 Type Badlo"
          />
        ))}
      </Section>

      {/* CITY SELLERS */}
      <Section title={`🛒 City Sellers (${citySellers.length})`} empty="Koi City Seller nahi" mt={24}>
        {citySellers.map(u => (
          <Row key={u._id} u={u}
            badge={<Badge bg="#f0fdf4" border="#16a34a" color="#15803d">🛒 City — 📍 {u.location || "—"}</Badge>}
            formOpen={formUid === u.uid}
            formCity={formCity} formType={formType}
            saving={saving}
            onOpenForm={() => openForm(u.uid, u.location || "", u.sellerType || "city_seller")}
            onCloseForm={closeForm}
            onCityChange={setFormCity}
            onTypeChange={setFormType}
            onSave={handleSave}
            onRemove={() => handleRemove(u.uid, u.name)}
            editLabel="🔄 Type Badlo"
          />
        ))}
      </Section>

      {/* NORMAL USERS */}
      <Section title={`👤 Normal Users (${normalUsers.length})`} empty="Koi normal user nahi" mt={24}>
        {normalUsers.map(u => (
          <Row key={u._id} u={u}
            badge={<Badge bg="#eff6ff" border="#93c5fd" color="#1d4ed8">👤 User</Badge>}
            formOpen={formUid === u.uid}
            formCity={formCity} formType={formType}
            saving={saving}
            onOpenForm={() => openForm(u.uid, u.location || "", u.sellerType || "city_seller")}
            onCloseForm={closeForm}
            onCityChange={setFormCity}
            onTypeChange={setFormType}
            onSave={handleSave}
            onRemove={null}
            editLabel="🛒 Seller Banao"
          />
        ))}
      </Section>

    </div>
  );
}

function Section({ title, empty, children, mt = 0 }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : (children ? [children] : []);
  return (
    <div style={{ marginTop: mt }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 12 }}>{title}</h3>
      {items.length === 0
        ? <div style={{ textAlign: "center", padding: 24, background: "#fff", borderRadius: 12, color: "#888", marginBottom: 12 }}>{empty}</div>
        : items
      }
    </div>
  );
}

function Badge({ bg, border, color, children }) {
  return (
    <span style={{ display: "inline-block", marginTop: 6, background: bg, border: `1px solid ${border}`, color, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {children}
    </span>
  );
}

function Row({ u, badge, formOpen, formCity, formType, saving, onOpenForm, onCloseForm, onCityChange, onTypeChange, onSave, onRemove, editLabel }) {
  return (
    <div style={{ background: "#fff", padding: "16px 20px", borderRadius: 14, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,.07)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>

      {/* LEFT: user info */}
      <div>
        <b style={{ fontSize: 16 }}>{u.name || "—"}</b>
        <p style={{ color: "#666", fontSize: 13, margin: "3px 0" }}>📞 {u.phone || "—"}</p>
        {badge}
      </div>

      {/* RIGHT: form or buttons */}
      <div>
        {formOpen ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select
                style={sel("#f97316", "#fff7ed")}
                value={formType}
                onChange={e => onTypeChange(e.target.value)}
              >
                <option value="city_seller">🛒 City Seller</option>
                <option value="thok_seller">🏭 Thok Mandi</option>
              </select>
              <select
                style={sel("#16a34a", "#f0fdf4")}
                value={formCity}
                onChange={e => onCityChange(e.target.value)}
              >
                <option value="">📍 City chuniye</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{ padding: "9px 18px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14, opacity: saving ? 0.6 : 1 }}
                onClick={onSave}
                disabled={saving}
              >
                {saving ? "⏳ Saving..." : "✅ Save"}
              </button>
              <button
                style={{ padding: "9px 14px", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
                onClick={onCloseForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={{ padding: "10px 16px", background: onRemove ? "#eff6ff" : "#16a34a", color: onRemove ? "#2563eb" : "#fff", border: onRemove ? "1px solid #bfdbfe" : "none", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 }}
              onClick={onOpenForm}
            >
              {editLabel}
            </button>
            {onRemove && (
              <button
                style={{ padding: "10px 14px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 }}
                onClick={onRemove}
              >
                ❌ Remove
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

function sel(borderColor, bg) {
  return { padding: "8px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, fontSize: 14, color: "#333", background: bg };
}
