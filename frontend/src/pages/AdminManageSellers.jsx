import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API;

const CITIES = [
  "Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore",
  "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
  "Noida", "Gurgaon"
];

export default function AdminManageSellers() {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // ✅ FIX: selectedUid + selectedCity ek saath object mein rakho
  // Pehle ek shared selectedCity thi — agar ek user ke liye select karo
  // aur dusre ke liye bhi select karo, state mix ho jaati thi.
  // Ab har user ka apna city dropdown hai: cityMap[uid] = "Delhi"
  const [cityMap, setCityMap] = useState({});           // { uid: "Delhi" }
  const [sellerTypeMap, setSellerTypeMap] = useState({}); // { uid: "city_seller"|"thok_seller" }
  const [selectedUid, setSelectedUid] = useState("");
  const [changeTypeUid, setChangeTypeUid] = useState(""); // existing seller ka type change
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/users`);
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ FIX: cityMap[uid] se city lo — shared state nahi
  async function assignSeller(uid) {
    const city       = cityMap[uid] || "";
    const sellerType = sellerTypeMap[uid] || "city_seller";

    if (!city) {
      setMsg("❌ Pehle city/location chuniye");
      return;
    }

    try {
      setActionLoading(true);
      setMsg("");
      const res = await axios.post(`${API}/api/users/assign-seller`, {
        uid,
        location: city,
        sellerType
      });
      setMsg("✅ " + res.data.message);
      loadUsers();
      setSelectedUid("");
      setCityMap(prev => { const n = { ...prev }; delete n[uid]; return n; });
      setSellerTypeMap(prev => { const n = { ...prev }; delete n[uid]; return n; });
    } catch (err) {
      setMsg("❌ Kuch gadbad hui, dobara try karo");
    } finally {
      setActionLoading(false);
    }
  }

  async function changeSeller(uid) {
    const currentUser = users.find(u => u.uid === uid);
    const city        = cityMap[uid] || currentUser?.location || "";
    const sellerType  = sellerTypeMap[uid] || currentUser?.sellerType || "city_seller";

    if (!city) {
      setMsg("❌ Pehle city/location chuniye");
      return;
    }

    try {
      setActionLoading(true);
      setMsg("");
      const res = await axios.post(`${API}/api/users/assign-seller`, {
        uid,
        location: city,
        sellerType
      });
      setMsg("✅ " + res.data.message);
      loadUsers();
      setChangeTypeUid("");
      setCityMap(prev => { const n = { ...prev }; delete n[uid]; return n; });
      setSellerTypeMap(prev => { const n = { ...prev }; delete n[uid]; return n; });
    } catch (err) {
      setMsg("❌ Kuch gadbad hui, dobara try karo");
    } finally {
      setActionLoading(false);
    }
  }

  async function removeSeller(uid, name) {
    if (!window.confirm(`${name} ka seller role remove karna chahte ho?`)) return;

    try {
      setActionLoading(true);
      setMsg("");
      await axios.post(`${API}/api/users/remove-seller`, { uid });
      setMsg("✅ Seller role remove ho gaya");
      loadUsers();
    } catch (err) {
      setMsg("❌ Kuch gadbad hui");
    } finally {
      setActionLoading(false);
    }
  }

  const filtered = users.filter(u =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.phone || "").includes(search) ||
    (u.uid || "").includes(search)
  );

  const sellers      = filtered.filter(u => u.role === "seller");
  const citySellers  = sellers.filter(u => !u.sellerType || u.sellerType === "city_seller");
  const thokSellers  = sellers.filter(u => u.sellerType === "thok_seller");
  const normalUsers  = filtered.filter(u => u.role !== "seller" && u.role !== "admin");

  if (loading) {
    return (
      <div style={centerBox}>
        <p>⏳ Users load ho rahe hain...</p>
      </div>
    );
  }

  return (
    <div style={wrap}>

      <h2 style={title}>👥 Sellers Manage Karo</h2>

      {/* Stats */}
      <div style={statsRow}>
        <StatCard label="Total Users"    value={users.length}        color="#3b82f6" />
        <StatCard label="City Sellers"   value={citySellers.length}  color="#16a34a" />
        <StatCard label="Thok Mandi"     value={thokSellers.length}  color="#f97316" />
        <StatCard label="Normal Users"   value={normalUsers.length}  color="#f59e0b" />
      </div>

      {/* Message */}
      {msg && (
        <div style={{
          ...msgBox,
          background: msg.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
          color:      msg.startsWith("✅") ? "#16a34a" : "#dc2626"
        }}>
          {msg}
        </div>
      )}

      {/* Search */}
      <input
        style={searchInput}
        placeholder="🔍 Naam, phone ya UID se dhundho..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* ── CITY SELLERS ── */}
      <h3 style={sectionTitle}>🛒 City Sellers ({citySellers.length})</h3>

      {citySellers.length === 0 ? (
        <div style={emptyBox}><p>Abhi koi City Seller nahi hai</p></div>
      ) : (
        citySellers.map(u => (
          <div key={u._id} style={userCard}>
            <div style={userInfo}>
              <b style={{ fontSize: 16 }}>{u.name || "—"}</b>
              <p style={subText}>📞 {u.phone || "—"}</p>
              <p style={subText}>🆔 {u.uid}</p>
              <div style={sellerBadge}>🛒 City Seller — 📍 {u.location || "Location nahi"}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
              {changeTypeUid === u.uid ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    style={{ ...citySelect, background: "#fff7ed", borderColor: "#f97316" }}
                    value={sellerTypeMap[u.uid] || "city_seller"}
                    onChange={e => setSellerTypeMap(prev => ({ ...prev, [u.uid]: e.target.value }))}
                  >
                    <option value="city_seller">🛒 City Seller</option>
                    <option value="thok_seller">🏭 Thok Mandi</option>
                  </select>
                  <select
                    style={citySelect}
                    value={cityMap[u.uid] || u.location || ""}
                    onChange={e => setCityMap(prev => ({ ...prev, [u.uid]: e.target.value }))}
                  >
                    <option value="">📍 City chuniye</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button style={confirmBtn} onClick={() => changeSeller(u.uid)} disabled={actionLoading}>
                    {actionLoading ? "⏳" : "✅ Save"}
                  </button>
                  <button style={cancelBtn} onClick={() => { setChangeTypeUid(""); setCityMap(prev => { const n={...prev}; delete n[u.uid]; return n; }); setSellerTypeMap(prev => { const n={...prev}; delete n[u.uid]; return n; }); }}>
                    Ruko
                  </button>
                </div>
              ) : (
                <button style={changeBtn} onClick={() => { setChangeTypeUid(u.uid); setMsg(""); }} disabled={actionLoading}>
                  🔄 Type Badlo
                </button>
              )}
              <button style={removeBtn} onClick={() => removeSeller(u.uid, u.name)} disabled={actionLoading}>
                ❌ Remove Seller
              </button>
            </div>
          </div>
        ))
      )}

      {/* ── THOK MANDI SELLERS ── */}
      <h3 style={{ ...sectionTitle, marginTop: 28 }}>🏭 Thok Mandi Sellers ({thokSellers.length})</h3>

      {thokSellers.length === 0 ? (
        <div style={emptyBox}><p>Abhi koi Thok Mandi Seller nahi hai</p></div>
      ) : (
        thokSellers.map(u => (
          <div key={u._id} style={userCard}>
            <div style={userInfo}>
              <b style={{ fontSize: 16 }}>{u.name || "—"}</b>
              <p style={subText}>📞 {u.phone || "—"}</p>
              <p style={subText}>🆔 {u.uid}</p>
              <div style={thokBadge}>🏭 Thok Mandi — 📍 {u.location || "Location nahi"}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
              {changeTypeUid === u.uid ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    style={{ ...citySelect, background: "#fff7ed", borderColor: "#f97316" }}
                    value={sellerTypeMap[u.uid] || "thok_seller"}
                    onChange={e => setSellerTypeMap(prev => ({ ...prev, [u.uid]: e.target.value }))}
                  >
                    <option value="city_seller">🛒 City Seller</option>
                    <option value="thok_seller">🏭 Thok Mandi</option>
                  </select>
                  <select
                    style={citySelect}
                    value={cityMap[u.uid] || u.location || ""}
                    onChange={e => setCityMap(prev => ({ ...prev, [u.uid]: e.target.value }))}
                  >
                    <option value="">📍 City chuniye</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button style={confirmBtn} onClick={() => changeSeller(u.uid)} disabled={actionLoading}>
                    {actionLoading ? "⏳" : "✅ Save"}
                  </button>
                  <button style={cancelBtn} onClick={() => { setChangeTypeUid(""); setCityMap(prev => { const n={...prev}; delete n[u.uid]; return n; }); setSellerTypeMap(prev => { const n={...prev}; delete n[u.uid]; return n; }); }}>
                    Ruko
                  </button>
                </div>
              ) : (
                <button style={changeBtn} onClick={() => { setChangeTypeUid(u.uid); setMsg(""); }} disabled={actionLoading}>
                  🔄 Type Badlo
                </button>
              )}
              <button style={removeBtn} onClick={() => removeSeller(u.uid, u.name)} disabled={actionLoading}>
                ❌ Remove Seller
              </button>
            </div>
          </div>
        ))
      )}

      {/* ── NORMAL USERS ── */}
      <h3 style={{ ...sectionTitle, marginTop: 32 }}>
        👤 Normal Users ({normalUsers.length})
      </h3>

      {normalUsers.length === 0 ? (
        <div style={emptyBox}>
          <p>Koi user nahi mila</p>
        </div>
      ) : (
        normalUsers.map(u => (
          <div key={u._id} style={userCard}>

            <div style={userInfo}>
              <b style={{ fontSize: 16 }}>{u.name || "—"}</b>
              <p style={subText}>📞 {u.phone || "—"}</p>
              <p style={subText}>🆔 {u.uid}</p>
              <div style={userBadge}>👤 User</div>
            </div>

            {/* ✅ FIX: Assign Seller Panel — har user ka apna cityMap[uid] */}
            <div style={assignPanel}>

              {selectedUid === u.uid ? (

                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>

                  {/* Seller Type */}
                  <select
                    style={{ ...citySelect, background: "#fff7ed", borderColor: "#f97316" }}
                    value={sellerTypeMap[u.uid] || "city_seller"}
                    onChange={e =>
                      setSellerTypeMap(prev => ({ ...prev, [u.uid]: e.target.value }))
                    }
                  >
                    <option value="city_seller">🛒 City Seller</option>
                    <option value="thok_seller">🏭 Thok Mandi</option>
                  </select>

                  {/* City / Location */}
                  <select
                    style={citySelect}
                    value={cityMap[u.uid] || ""}
                    onChange={e =>
                      setCityMap(prev => ({ ...prev, [u.uid]: e.target.value }))
                    }
                  >
                    <option value="">📍 City chuniye</option>
                    {CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <button
                    style={confirmBtn}
                    onClick={() => assignSeller(u.uid)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "⏳" : "✅ Confirm"}
                  </button>

                  <button
                    style={cancelBtn}
                    onClick={() => {
                      setSelectedUid("");
                      setCityMap(prev => { const n = { ...prev }; delete n[u.uid]; return n; });
                      setSellerTypeMap(prev => { const n = { ...prev }; delete n[u.uid]; return n; });
                    }}
                  >
                    Ruko
                  </button>
                </div>

              ) : (

                <button
                  style={assignBtn}
                  onClick={() => { setSelectedUid(u.uid); setMsg(""); }}
                >
                  🛒 Seller Banao
                </button>

              )}

            </div>

          </div>
        ))
      )}

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

/* ─── STYLES ─── */

const wrap = {
  padding: 20,
  background: "#f3f4f6",
  minHeight: "100vh"
};

const centerBox = {
  padding: 60,
  textAlign: "center"
};

const title = {
  margin: "0 0 20px",
  fontSize: 22,
  color: "#15803d"
};

const statsRow = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 14,
  marginBottom: 20
};

const statCard = {
  background: "#fff",
  padding: "14px 18px",
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,.08)"
};

const msgBox = {
  padding: "12px 16px",
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 14,
  marginBottom: 16
};

const searchInput = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 15,
  marginBottom: 24,
  boxSizing: "border-box"
};

const sectionTitle = {
  fontSize: 16,
  fontWeight: 700,
  color: "#374151",
  marginBottom: 12
};

const emptyBox = {
  textAlign: "center",
  padding: 30,
  background: "#fff",
  borderRadius: 12,
  color: "#888",
  boxShadow: "0 2px 8px rgba(0,0,0,.06)"
};

const userCard = {
  background: "#fff",
  padding: "16px 20px",
  borderRadius: 14,
  marginBottom: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,.07)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 12
};

const userInfo = {
  flex: 1
};

const subText = {
  color: "#666",
  fontSize: 13,
  margin: "3px 0"
};

const sellerBadge = {
  display: "inline-block",
  marginTop: 6,
  background: "#f0fdf4",
  border: "1px solid #16a34a",
  color: "#15803d",
  padding: "4px 12px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600
};

const thokBadge = {
  display: "inline-block",
  marginTop: 6,
  background: "#fff7ed",
  border: "1px solid #f97316",
  color: "#c2410c",
  padding: "4px 12px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600
};

const userBadge = {
  display: "inline-block",
  marginTop: 6,
  background: "#eff6ff",
  border: "1px solid #93c5fd",
  color: "#1d4ed8",
  padding: "4px 12px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600
};

const assignPanel = {
  flexShrink: 0
};

const assignBtn = {
  padding: "10px 18px",
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14
};

const citySelect = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #16a34a",
  fontSize: 14,
  color: "#333",
  background: "#f0fdf4"
};

const confirmBtn = {
  padding: "8px 14px",
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14
};

const cancelBtn = {
  padding: "8px 14px",
  background: "#f3f4f6",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14
};

const removeBtn = {
  padding: "10px 16px",
  background: "#fef2f2",
  color: "#dc2626",
  border: "1px solid #fca5a5",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14
};

const changeBtn = {
  padding: "10px 16px",
  background: "#eff6ff",
  color: "#2563eb",
  border: "1px solid #bfdbfe",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14
};