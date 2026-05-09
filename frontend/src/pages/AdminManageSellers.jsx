import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API;

const CITIES = [
  "Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore",
  "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
  "Noida", "Gurgaon"
];

export default function AdminManageSellers() {

  const [users, setUsers]           = useState([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState({ msg: "", ok: true });
  const [actionUid, setActionUid]   = useState(""); // which uid is in action
  const [formMap, setFormMap]       = useState({}); // { uid: { city, sellerType, mode: "assign"|"change" } }

  useEffect(() => { loadUsers(); }, []);

  function showToast(msg, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 3000);
  }

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/users`);
      setUsers(res.data);
    } catch (err) {
      showToast("❌ Users load nahi hue", false);
    } finally {
      setLoading(false);
    }
  }

  function openForm(uid, mode, currentCity = "", currentType = "city_seller") {
    setFormMap(prev => ({
      ...prev,
      [uid]: { city: currentCity, sellerType: currentType, mode }
    }));
  }

  function closeForm(uid) {
    setFormMap(prev => { const n = { ...prev }; delete n[uid]; return n; });
  }

  async function saveForm(uid) {
    const form = formMap[uid];
    if (!form) return;

    const { city, sellerType } = form;

    if (!city) {
      showToast("❌ Pehle city chuniye", false);
      return;
    }

    try {
      setActionUid(uid);
      const res = await axios.post(`${API}/api/users/assign-seller`, {
        uid, location: city, sellerType
      });
      showToast("✅ " + res.data.message, true);
      closeForm(uid);
      await loadUsers();
    } catch (err) {
      showToast("❌ Save nahi hua — " + (err.response?.data?.error || err.message), false);
    } finally {
      setActionUid("");
    }
  }

  async function removeSeller(uid, name) {
    if (!window.confirm(`${name} ka seller role remove karna chahte ho?`)) return;
    try {
      setActionUid(uid);
      await axios.post(`${API}/api/users/remove-seller`, { uid });
      showToast("✅ Seller role remove ho gaya", true);
      await loadUsers();
    } catch (err) {
      showToast("❌ Remove nahi hua", false);
    } finally {
      setActionUid("");
    }
  }

  const filtered     = users.filter(u =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.phone || "").includes(search)
  );
  const sellers      = filtered.filter(u => u.role === "seller");
  const citySellers  = sellers.filter(u => !u.sellerType || u.sellerType === "city_seller");
  const thokSellers  = sellers.filter(u => u.sellerType === "thok_seller");
  const normalUsers  = filtered.filter(u => u.role !== "seller" && u.role !== "admin");

  if (loading) return <div style={centerBox}><p>⏳ Load ho raha hai...</p></div>;

  return (
    <div style={wrap}>

      {/* TOAST */}
      {toast.msg && (
        <div style={{
          ...toastStyle,
          background: toast.ok ? "#f0fdf4" : "#fef2f2",
          color:      toast.ok ? "#16a34a" : "#dc2626",
          border:     `1px solid ${toast.ok ? "#c6e8c6" : "#fecaca"}`
        }}>
          {toast.msg}
        </div>
      )}

      <h2 style={titleStyle}>👥 Sellers Manage Karo</h2>

      {/* STATS */}
      <div style={statsRow}>
        <StatCard label="Total Users"  value={users.length}       color="#3b82f6" />
        <StatCard label="City Sellers" value={citySellers.length} color="#16a34a" />
        <StatCard label="Thok Mandi"   value={thokSellers.length} color="#f97316" />
        <StatCard label="Normal Users" value={normalUsers.length} color="#f59e0b" />
      </div>

      {/* SEARCH */}
      <input
        style={searchInput}
        placeholder="🔍 Naam ya phone se dhundho..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* ── THOK MANDI SELLERS ── */}
      <h3 style={{ ...sectionTitle, marginTop: 8 }}>🏭 Thok Mandi Sellers ({thokSellers.length})</h3>
      {thokSellers.length === 0
        ? <div style={emptyBox}>Abhi koi Thok Mandi Seller nahi hai</div>
        : thokSellers.map(u => (
          <UserCard
            key={u._id} u={u}
            form={formMap[u.uid]}
            busy={actionUid === u.uid}
            badgeStyle={thokBadge}
            badgeLabel={`🏭 Thok Mandi — 📍 ${u.location || "—"}`}
            onEdit={() => openForm(u.uid, "change", u.location, u.sellerType || "thok_seller")}
            onClose={() => closeForm(u.uid)}
            onSave={() => saveForm(u.uid)}
            onRemove={() => removeSeller(u.uid, u.name)}
            onFormChange={(field, val) =>
              setFormMap(prev => ({ ...prev, [u.uid]: { ...prev[u.uid], [field]: val } }))
            }
          />
        ))
      }

      {/* ── CITY SELLERS ── */}
      <h3 style={{ ...sectionTitle, marginTop: 24 }}>🛒 City Sellers ({citySellers.length})</h3>
      {citySellers.length === 0
        ? <div style={emptyBox}>Abhi koi City Seller nahi hai</div>
        : citySellers.map(u => (
          <UserCard
            key={u._id} u={u}
            form={formMap[u.uid]}
            busy={actionUid === u.uid}
            badgeStyle={sellerBadge}
            badgeLabel={`🛒 City Seller — 📍 ${u.location || "—"}`}
            onEdit={() => openForm(u.uid, "change", u.location, u.sellerType || "city_seller")}
            onClose={() => closeForm(u.uid)}
            onSave={() => saveForm(u.uid)}
            onRemove={() => removeSeller(u.uid, u.name)}
            onFormChange={(field, val) =>
              setFormMap(prev => ({ ...prev, [u.uid]: { ...prev[u.uid], [field]: val } }))
            }
          />
        ))
      }

      {/* ── NORMAL USERS ── */}
      <h3 style={{ ...sectionTitle, marginTop: 24 }}>👤 Normal Users ({normalUsers.length})</h3>
      {normalUsers.length === 0
        ? <div style={emptyBox}>Koi normal user nahi</div>
        : normalUsers.map(u => (
          <UserCard
            key={u._id} u={u}
            form={formMap[u.uid]}
            busy={actionUid === u.uid}
            badgeStyle={userBadge}
            badgeLabel="👤 User"
            onEdit={() => openForm(u.uid, "assign", "", "city_seller")}
            onClose={() => closeForm(u.uid)}
            onSave={() => saveForm(u.uid)}
            onRemove={null}
            onFormChange={(field, val) =>
              setFormMap(prev => ({ ...prev, [u.uid]: { ...prev[u.uid], [field]: val } }))
            }
          />
        ))
      }

    </div>
  );
}

function UserCard({ u, form, busy, badgeStyle, badgeLabel, onEdit, onClose, onSave, onRemove, onFormChange }) {
  return (
    <div style={userCard}>
      <div style={userInfo}>
        <b style={{ fontSize: 16 }}>{u.name || "—"}</b>
        <p style={subText}>📞 {u.phone || "—"}</p>
        <p style={{ ...subText, fontSize: 11, color: "#bbb" }}>UID: {u.uid}</p>
        <div style={badgeStyle}>{badgeLabel}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
        {form ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {/* Seller Type */}
              <select
                style={{ ...selectStyle, borderColor: "#f97316", background: "#fff7ed" }}
                value={form.sellerType}
                onChange={e => onFormChange("sellerType", e.target.value)}
              >
                <option value="city_seller">🛒 City Seller</option>
                <option value="thok_seller">🏭 Thok Mandi</option>
              </select>

              {/* City */}
              <select
                style={selectStyle}
                value={form.city}
                onChange={e => onFormChange("city", e.target.value)}
              >
                <option value="">📍 City chuniye</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button style={confirmBtn} onClick={onSave} disabled={busy}>
                {busy ? "⏳ Saving..." : "✅ Save"}
              </button>
              <button style={cancelBtn} onClick={onClose} disabled={busy}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={onRemove ? changeBtn : assignBtn}
              onClick={onEdit}
              disabled={busy}
            >
              {onRemove ? "🔄 Type Badlo" : "🛒 Seller Banao"}
            </button>
            {onRemove && (
              <button style={removeBtn} onClick={onRemove} disabled={busy}>
                ❌ Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ ...statCard, borderTop: `4px solid ${color}` }}>
      <p style={{ color: "#666", fontSize: 13, margin: 0 }}>{label}</p>
      <h2 style={{ margin: "4px 0 0", color }}>{value}</h2>
    </div>
  );
}

/* ── STYLES ── */
const wrap        = { padding: 20, background: "#f3f4f6", minHeight: "100vh" };
const centerBox   = { padding: 60, textAlign: "center" };
const titleStyle  = { margin: "0 0 20px", fontSize: 22, color: "#15803d" };

const toastStyle  = {
  position: "fixed", top: 20, right: 20, zIndex: 9999,
  padding: "14px 20px", borderRadius: 12, fontWeight: 700,
  fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  animation: "fadeIn 0.2s ease"
};

const statsRow    = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 20 };
const statCard    = { background: "#fff", padding: "14px 18px", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,.08)" };

const searchInput = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #d1d5db", fontSize: 15, marginBottom: 20, boxSizing: "border-box" };

const sectionTitle = { fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 12 };
const emptyBox     = { textAlign: "center", padding: 24, background: "#fff", borderRadius: 12, color: "#888", boxShadow: "0 2px 8px rgba(0,0,0,.06)", marginBottom: 12 };

const userCard  = { background: "#fff", padding: "16px 20px", borderRadius: 14, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,.07)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 };
const userInfo  = { flex: 1 };
const subText   = { color: "#666", fontSize: 13, margin: "3px 0" };

const sellerBadge = { display: "inline-block", marginTop: 6, background: "#f0fdf4", border: "1px solid #16a34a", color: "#15803d", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 };
const thokBadge   = { display: "inline-block", marginTop: 6, background: "#fff7ed", border: "1px solid #f97316", color: "#c2410c", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 };
const userBadge   = { display: "inline-block", marginTop: 6, background: "#eff6ff", border: "1px solid #93c5fd", color: "#1d4ed8", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 };

const selectStyle = { padding: "8px 12px", borderRadius: 8, border: "1px solid #16a34a", fontSize: 14, color: "#333", background: "#f0fdf4" };

const assignBtn  = { padding: "10px 18px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 };
const changeBtn  = { padding: "10px 16px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 };
const removeBtn  = { padding: "10px 14px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 };
const confirmBtn = { padding: "9px 16px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 };
const cancelBtn  = { padding: "9px 14px", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer", fontSize: 14 };
