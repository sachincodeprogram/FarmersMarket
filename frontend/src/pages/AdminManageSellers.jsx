import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Nunito:wght@400;600;700;800&display=swap');

  .ams-wrap { min-height:100vh; background:#f0f4f8; font-family:'Nunito',sans-serif; }

  /* HERO */
  .ams-hero {
    background: linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f4c35 100%);
    padding: 36px 24px 48px;
    position: relative; overflow: hidden;
  }
  .ams-hero::after {
    content:''; position:absolute; inset:0;
    background: radial-gradient(ellipse at 70% 50%, rgba(52,211,153,.12) 0%, transparent 70%);
    pointer-events:none;
  }
  .ams-hero-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2);
    color:#fff; font-size:12px; font-weight:700; letter-spacing:.06em;
    padding:5px 14px; border-radius:100px; margin-bottom:14px;
  }
  .ams-hero-title {
    font-family:'Playfair Display',serif; font-size:28px; font-weight:800;
    color:#fff; margin:0 0 6px; line-height:1.2;
  }
  .ams-hero-sub { color:rgba(255,255,255,.6); font-size:14px; margin:0 0 28px; }
  .ams-hero-stats { display:flex; gap:14px; flex-wrap:wrap; }
  .ams-hstat {
    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15);
    border-radius:14px; padding:14px 20px; min-width:100px; text-align:center;
    backdrop-filter:blur(6px);
  }
  .ams-hstat-val { font-family:'Playfair Display',serif; font-size:26px; font-weight:800; color:#fff; line-height:1; }
  .ams-hstat-lbl { font-size:11px; color:rgba(255,255,255,.6); font-weight:600; margin-top:4px; letter-spacing:.04em; text-transform:uppercase; }

  /* BODY */
  .ams-body { padding:24px 20px; max-width:900px; margin:0 auto; }

  /* TOAST */
  .ams-toast {
    position:fixed; top:22px; right:22px; z-index:9999;
    padding:14px 22px; border-radius:14px; font-weight:700; font-size:14px;
    box-shadow:0 6px 24px rgba(0,0,0,.18);
    animation: fadeUp .3s ease;
  }

  /* CARD */
  .ams-card {
    background:#fff; border-radius:18px; padding:22px 24px;
    box-shadow:0 2px 12px rgba(0,0,0,.07); margin-bottom:24px;
    animation: fadeUp .4s ease;
  }
  .ams-card-title {
    font-family:'Playfair Display',serif; font-size:17px; font-weight:800;
    margin:0 0 18px; display:flex; align-items:center; gap:10px;
  }
  .ams-card-count {
    font-family:'Nunito',sans-serif; font-size:13px; font-weight:700;
    padding:3px 12px; border-radius:100px;
  }

  /* CITY CHIPS */
  .ams-city-row { display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
  .ams-city-input {
    flex:1; min-width:160px; padding:11px 14px; border-radius:12px;
    border:1.5px solid #93c5fd; font-size:14px; font-family:'Nunito',sans-serif;
    outline:none; transition:border .2s;
  }
  .ams-city-input:focus { border-color:#3b82f6; }
  .ams-city-add-btn {
    padding:11px 22px; background:linear-gradient(135deg,#1d4ed8,#3b82f6);
    color:#fff; border:none; border-radius:12px; font-weight:700; font-size:14px;
    cursor:pointer; font-family:'Nunito',sans-serif; transition:opacity .2s;
  }
  .ams-city-add-btn:disabled { opacity:.55; cursor:not-allowed; }
  .ams-chips { display:flex; flex-wrap:wrap; gap:9px; }
  .ams-chip {
    display:flex; align-items:center; gap:7px;
    background:#eff6ff; border:1px solid #bfdbfe; border-radius:100px; padding:6px 14px;
  }
  .ams-chip-name { font-size:13px; font-weight:700; color:#1e40af; }
  .ams-chip-del {
    background:none; border:none; cursor:pointer; color:#dc2626;
    font-weight:800; font-size:15px; line-height:1; padding:0 2px;
    transition:transform .15s;
  }
  .ams-chip-del:hover { transform:scale(1.25); }

  /* SEARCH */
  .ams-search {
    width:100%; padding:13px 18px; border-radius:14px; border:1.5px solid #d1d5db;
    font-size:15px; font-family:'Nunito',sans-serif; margin-bottom:24px;
    box-sizing:border-box; outline:none; transition:border .2s;
  }
  .ams-search:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.1); }

  /* SECTION */
  .ams-section { margin-bottom:28px; animation: fadeUp .45s ease; }
  .ams-section-hdr {
    font-family:'Playfair Display',serif; font-size:16px; font-weight:800;
    color:#1e293b; margin-bottom:14px; display:flex; align-items:center; gap:10px;
  }
  .ams-section-badge {
    font-family:'Nunito',sans-serif; font-size:12px; font-weight:700;
    padding:3px 11px; border-radius:100px;
  }
  .ams-empty {
    text-align:center; padding:28px; background:#fff; border-radius:16px;
    color:#9ca3af; font-size:14px; border:1.5px dashed #e5e7eb;
  }

  /* USER CARD */
  .ams-ucard {
    background:#fff; border-radius:16px; padding:16px 20px;
    margin-bottom:12px; box-shadow:0 2px 10px rgba(0,0,0,.07);
    display:flex; justify-content:space-between; align-items:center;
    flex-wrap:wrap; gap:12px; border-left:4px solid transparent;
    transition:box-shadow .2s, transform .2s;
  }
  .ams-ucard:hover { box-shadow:0 6px 20px rgba(0,0,0,.12); transform:translateY(-1px); }
  .ams-ucard.city  { border-left-color:#16a34a; }
  .ams-ucard.thok  { border-left-color:#f97316; }
  .ams-ucard.user  { border-left-color:#3b82f6; }

  .ams-avatar {
    width:44px; height:44px; border-radius:50%; display:flex;
    align-items:center; justify-content:center; font-size:18px; font-weight:800;
    flex-shrink:0; color:#fff;
  }
  .ams-uinfo { flex:1; min-width:120px; }
  .ams-uname { font-size:15px; font-weight:800; color:#1e293b; margin:0 0 3px; }
  .ams-uphone { font-size:13px; color:#6b7280; margin:0 0 6px; }

  .ams-role-badge {
    display:inline-block; font-size:11px; font-weight:700; padding:3px 11px;
    border-radius:100px; letter-spacing:.03em;
  }

  /* FORM */
  .ams-form { display:flex; flex-direction:column; gap:9px; align-items:flex-end; }
  .ams-form-row { display:flex; gap:8px; flex-wrap:wrap; }
  .ams-form-sel {
    padding:9px 13px; border-radius:10px; font-size:14px;
    font-family:'Nunito',sans-serif; color:#333; cursor:pointer; outline:none;
  }
  .ams-form-btns { display:flex; gap:8px; }
  .ams-btn-save {
    padding:10px 20px; background:linear-gradient(135deg,#16a34a,#22c55e);
    color:#fff; border:none; border-radius:10px; cursor:pointer;
    font-weight:700; font-size:14px; font-family:'Nunito',sans-serif; transition:opacity .2s;
  }
  .ams-btn-save:disabled { opacity:.6; cursor:not-allowed; }
  .ams-btn-cancel {
    padding:10px 16px; background:#f3f4f6; color:#374151; border:1px solid #d1d5db;
    border-radius:10px; cursor:pointer; font-size:14px; font-family:'Nunito',sans-serif;
  }

  .ams-action-row { display:flex; gap:8px; }
  .ams-btn-edit {
    padding:10px 16px; border-radius:10px; cursor:pointer;
    font-weight:700; font-size:13px; font-family:'Nunito',sans-serif;
    border:none; transition:opacity .2s, transform .15s;
  }
  .ams-btn-edit:hover { opacity:.85; transform:scale(1.02); }
  .ams-btn-remove {
    padding:10px 14px; background:#fef2f2; color:#dc2626;
    border:1px solid #fca5a5; border-radius:10px; cursor:pointer;
    font-weight:700; font-size:13px; font-family:'Nunito',sans-serif;
    transition:opacity .2s, transform .15s;
  }
  .ams-btn-remove:hover { opacity:.85; transform:scale(1.02); }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;

export default function AdminManageSellers() {

  const [users, setUsers]         = useState([]);
  const [cities, setCities]       = useState([]);
  const [newCity, setNewCity]     = useState("");
  const [cityLoading, setCityLoading] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [toast, setToast]         = useState("");
  const [toastOk, setToastOk]     = useState(true);
  const [formUid, setFormUid]     = useState("");
  const [formCity, setFormCity]   = useState("");
  const [formType, setFormType]   = useState("city_seller");
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");

  useEffect(() => {
    fetchUsers();
    fetchCities();
  }, []);

  async function fetchCities() {
    try {
      const res = await axios.get(`${API}/api/cities`);
      setCities(Array.isArray(res.data) ? res.data : []);
    } catch (_) {}
  }

  async function addCity() {
    const name = newCity.trim();
    if (!name) return;
    try {
      setCityLoading(true);
      await axios.post(`${API}/api/cities`, { name });
      setNewCity("");
      await fetchCities();
      flash("✅ City add ho gayi: " + name, true);
    } catch (e) {
      flash("❌ " + (e.response?.data?.error || e.message), false);
    } finally { setCityLoading(false); }
  }

  async function deleteCity(name) {
    if (!window.confirm(`"${name}" city delete karna chahte ho? Is city ke sellers ka data safe rahega.`)) return;
    try {
      setCityLoading(true);
      await axios.delete(`${API}/api/cities/${encodeURIComponent(name)}`);
      await fetchCities();
      flash("✅ City delete ho gayi: " + name, true);
    } catch (e) {
      flash("❌ " + (e.response?.data?.error || e.message), false);
    } finally { setCityLoading(false); }
  }

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
    if (!formCity) { flash("❌ Pehle city chuniye", false); return; }
    try {
      setSaving(true);
      const res = await axios.post(`${API}/api/users/assign-seller`, {
        uid: formUid, location: formCity, sellerType: formType
      });
      flash("✅ " + res.data.message, true);
      closeForm();
      const r2 = await axios.get(`${API}/api/users`);
      setUsers(Array.isArray(r2.data) ? r2.data : []);
    } catch (e) {
      flash("❌ " + (e.response?.data?.error || e.message), false);
    } finally { setSaving(false); }
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
    } finally { setSaving(false); }
  }

  const q = search.toLowerCase();
  const filtered    = users.filter(u =>
    (u.name || "").toLowerCase().includes(q) || (u.phone || "").includes(q)
  );
  const thokSellers = filtered.filter(u => u.role === "seller" && u.sellerType === "thok_seller");
  const citySellers = filtered.filter(u => u.role === "seller" && (!u.sellerType || u.sellerType === "city_seller"));
  const normalUsers = filtered.filter(u => u.role !== "seller" && u.role !== "admin");

  if (loading) return (
    <div className="ams-wrap" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{css}</style>
      <div style={{ textAlign:"center", color:"#6b7280", fontSize:16, fontFamily:"Nunito,sans-serif" }}>
        <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
        Load ho raha hai...
      </div>
    </div>
  );

  if (error) return (
    <div className="ams-wrap" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{css}</style>
      <div style={{ textAlign:"center", padding:32, background:"#fff", borderRadius:18, color:"#dc2626", maxWidth:400 }}>
        <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
        <p style={{ fontFamily:"Nunito,sans-serif" }}>{error}</p>
        <button onClick={fetchUsers} style={{ marginTop:12, padding:"10px 24px", background:"#dc2626", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontFamily:"Nunito,sans-serif" }}>
          Dobara Try Karo
        </button>
      </div>
    </div>
  );

  return (
    <div className="ams-wrap">
      <style>{css}</style>

      {/* TOAST */}
      {toast && (
        <div className="ams-toast" style={{
          background: toastOk ? "#f0fdf4" : "#fef2f2",
          color:      toastOk ? "#16a34a" : "#dc2626",
          border:     `1px solid ${toastOk ? "#c6e8c6" : "#fecaca"}`,
        }}>
          {toast}
        </div>
      )}

      {/* HERO */}
      <div className="ams-hero">
        <div className="ams-hero-badge">🔐 Admin Panel</div>
        <h1 className="ams-hero-title">Sellers Manage Karo</h1>
        <p className="ams-hero-sub">Users ko sellers assign karo, cities manage karo</p>
        <div className="ams-hero-stats">
          {[
            { val: users.length,       lbl: "Total Users",  col: "#60a5fa" },
            { val: citySellers.length, lbl: "City Sellers", col: "#34d399" },
            { val: thokSellers.length, lbl: "Thok Mandi",   col: "#fb923c" },
            { val: normalUsers.length, lbl: "Normal Users", col: "#fbbf24" },
          ].map(s => (
            <div className="ams-hstat" key={s.lbl}>
              <div className="ams-hstat-val" style={{ color: s.col }}>{s.val}</div>
              <div className="ams-hstat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ams-body">

        {/* CITY MANAGEMENT */}
        <div className="ams-card" style={{ borderTop:"4px solid #3b82f6" }}>
          <div className="ams-card-title" style={{ color:"#1e40af" }}>
            🏙️ Cities Manage Karo
            <span className="ams-card-count" style={{ background:"#eff6ff", color:"#1d4ed8" }}>
              {cities.length} cities
            </span>
          </div>
          <div className="ams-city-row">
            <input
              className="ams-city-input"
              placeholder="Nayi city ka naam (e.g. Agra)"
              value={newCity}
              onChange={e => setNewCity(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addCity(); }}
            />
            <button
              className="ams-city-add-btn"
              onClick={addCity}
              disabled={cityLoading || !newCity.trim()}
            >
              + Add City
            </button>
          </div>
          <div className="ams-chips">
            {cities.length === 0
              ? <span style={{ color:"#aaa", fontSize:13 }}>Koi city nahi</span>
              : cities.map(c => (
                <div className="ams-chip" key={c}>
                  <span className="ams-chip-name">📍 {c}</span>
                  <button className="ams-chip-del" onClick={() => deleteCity(c)} title={`${c} delete karo`}>×</button>
                </div>
              ))
            }
          </div>
        </div>

        {/* SEARCH */}
        <input
          className="ams-search"
          placeholder="🔍 Naam ya phone se dhundho..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* THOK SELLERS */}
        <div className="ams-section">
          <div className="ams-section-hdr">
            🏭 Thok Mandi Sellers
            <span className="ams-section-badge" style={{ background:"#fff7ed", color:"#c2410c" }}>
              {thokSellers.length}
            </span>
          </div>
          {thokSellers.length === 0
            ? <div className="ams-empty">Koi Thok Mandi Seller nahi</div>
            : thokSellers.map(u => (
              <UserCard key={u._id} u={u} variant="thok"
                roleBadge={{ bg:"#fff7ed", border:"#f97316", color:"#c2410c", text:`🏭 Thok — 📍 ${u.location || "—"}` }}
                formOpen={formUid === u.uid}
                formCity={formCity} formType={formType} cities={cities} saving={saving}
                onOpenForm={() => openForm(u.uid, u.location || "", u.sellerType || "thok_seller")}
                onCloseForm={closeForm}
                onCityChange={setFormCity} onTypeChange={setFormType}
                onSave={handleSave}
                onRemove={() => handleRemove(u.uid, u.name)}
                editLabel="🔄 Type Badlo"
              />
            ))
          }
        </div>

        {/* CITY SELLERS */}
        <div className="ams-section">
          <div className="ams-section-hdr">
            🛒 City Sellers
            <span className="ams-section-badge" style={{ background:"#f0fdf4", color:"#15803d" }}>
              {citySellers.length}
            </span>
          </div>
          {citySellers.length === 0
            ? <div className="ams-empty">Koi City Seller nahi</div>
            : citySellers.map(u => (
              <UserCard key={u._id} u={u} variant="city"
                roleBadge={{ bg:"#f0fdf4", border:"#16a34a", color:"#15803d", text:`🛒 City — 📍 ${u.location || "—"}` }}
                formOpen={formUid === u.uid}
                formCity={formCity} formType={formType} cities={cities} saving={saving}
                onOpenForm={() => openForm(u.uid, u.location || "", u.sellerType || "city_seller")}
                onCloseForm={closeForm}
                onCityChange={setFormCity} onTypeChange={setFormType}
                onSave={handleSave}
                onRemove={() => handleRemove(u.uid, u.name)}
                editLabel="🔄 Type Badlo"
              />
            ))
          }
        </div>

        {/* NORMAL USERS */}
        <div className="ams-section">
          <div className="ams-section-hdr">
            👤 Normal Users
            <span className="ams-section-badge" style={{ background:"#eff6ff", color:"#1d4ed8" }}>
              {normalUsers.length}
            </span>
          </div>
          {normalUsers.length === 0
            ? <div className="ams-empty">Koi normal user nahi</div>
            : normalUsers.map(u => (
              <UserCard key={u._id} u={u} variant="user"
                roleBadge={{ bg:"#eff6ff", border:"#93c5fd", color:"#1d4ed8", text:"👤 User" }}
                formOpen={formUid === u.uid}
                formCity={formCity} formType={formType} cities={cities} saving={saving}
                onOpenForm={() => openForm(u.uid, u.location || "", u.sellerType || "city_seller")}
                onCloseForm={closeForm}
                onCityChange={setFormCity} onTypeChange={setFormType}
                onSave={handleSave}
                onRemove={null}
                editLabel="🛒 Seller Banao"
              />
            ))
          }
        </div>

      </div>
    </div>
  );
}

function avatarColor(variant) {
  if (variant === "thok") return "linear-gradient(135deg,#f97316,#ea580c)";
  if (variant === "city") return "linear-gradient(135deg,#16a34a,#22c55e)";
  return "linear-gradient(135deg,#3b82f6,#6366f1)";
}

function UserCard({ u, variant, roleBadge, formOpen, formCity, formType, cities, saving, onOpenForm, onCloseForm, onCityChange, onTypeChange, onSave, onRemove, editLabel }) {
  const initials = (u.name || "?").slice(0, 2).toUpperCase();
  return (
    <div className={`ams-ucard ${variant}`}>
      <div style={{ display:"flex", alignItems:"center", gap:14, flex:1, minWidth:0 }}>
        <div className="ams-avatar" style={{ background: avatarColor(variant) }}>{initials}</div>
        <div className="ams-uinfo">
          <p className="ams-uname">{u.name || "—"}</p>
          <p className="ams-uphone">📞 {u.phone || "—"}</p>
          <span className="ams-role-badge" style={{ background: roleBadge.bg, border:`1px solid ${roleBadge.border}`, color: roleBadge.color }}>
            {roleBadge.text}
          </span>
        </div>
      </div>

      <div>
        {formOpen ? (
          <div className="ams-form">
            <div className="ams-form-row">
              <select
                className="ams-form-sel"
                style={{ border:"1.5px solid #f97316", background:"#fff7ed" }}
                value={formType}
                onChange={e => onTypeChange(e.target.value)}
              >
                <option value="city_seller">🛒 City Seller</option>
                <option value="thok_seller">🏭 Thok Mandi</option>
              </select>
              <select
                className="ams-form-sel"
                style={{ border:"1.5px solid #16a34a", background:"#f0fdf4" }}
                value={formCity}
                onChange={e => onCityChange(e.target.value)}
              >
                <option value="">📍 City chuniye</option>
                {(cities || []).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="ams-form-btns">
              <button className="ams-btn-save" onClick={onSave} disabled={saving}>
                {saving ? "⏳ Saving..." : "✅ Save"}
              </button>
              <button className="ams-btn-cancel" onClick={onCloseForm} disabled={saving}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="ams-action-row">
            <button
              className="ams-btn-edit"
              style={{
                background: onRemove ? "linear-gradient(135deg,#eff6ff,#dbeafe)" : "linear-gradient(135deg,#16a34a,#22c55e)",
                color: onRemove ? "#2563eb" : "#fff",
                border: onRemove ? "1px solid #bfdbfe" : "none",
              }}
              onClick={onOpenForm}
            >
              {editLabel}
            </button>
            {onRemove && (
              <button className="ams-btn-remove" onClick={onRemove}>❌ Remove</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
