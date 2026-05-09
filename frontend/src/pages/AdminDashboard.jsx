import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API;

export default function AdminDashboard() {

  const [data, setData]               = useState({});
  const [sellers, setSellers]         = useState([]);
  const [pending, setPending]         = useState([]);
  const [delivered, setDelivered]     = useState([]);
  const [showPending, setShowPending]   = useState(true);
  const [showDelivered, setShowDelivered] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/orders/admin/summary`).then(r => setData(r.data));
    axios.get(`${API}/api/users`).then(r => setSellers(r.data.filter(u => u.role === "seller")));
    axios.get(`${API}/api/orders/admin`).then(r => setPending(Array.isArray(r.data) ? r.data : []));
    axios.get(`${API}/api/orders/admin/delivered`).then(r => setDelivered(Array.isArray(r.data) ? r.data : []));
  }, []);

  function fmtDateTime(d) {
    const dt = new Date(d);
    const date = dt.toLocaleDateString("hi-IN", { day: "2-digit", month: "short", year: "numeric" });
    const time = dt.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    return `${date}, ${time}`;
  }

  const citySellers = sellers.filter(u => !u.sellerType || u.sellerType === "city_seller");
  const thokSellers = sellers.filter(u => u.sellerType === "thok_seller");
  const maxVal      = Math.max(data.totalOrders || 0, data.today || 0, 1);

  return (
    <>
      <style>{css}</style>
      <div className="ad-root">

        {/* ── HERO */}
        <div className="ad-hero">
          <div className="ad-hero-inner">
            <div>
              <div className="ad-hero-badge">🔐 Admin Panel</div>
              <h1 className="ad-hero-title">Dashboard</h1>
              <p className="ad-hero-sub">Kisan Marketplace — Full Overview</p>
            </div>
            <div className="ad-hero-stats">
              <HeroStat label="Total Orders" value={data.totalOrders || 0} color="#4ade80" />
              <HeroStat label="Total Sales"  value={`₹${data.totalSales || 0}`} color="#fbbf24" />
              <HeroStat label="Aaj Ke Orders" value={data.today || 0} color="#60a5fa" />
            </div>
          </div>
        </div>

        <div className="ad-body">

          {/* ── SELLERS OVERVIEW */}
          <section className="ad-section">
            <h2 className="ad-section-title">👥 Sellers Overview</h2>
            <div className="ad-sellers-grid">

              <div className="ad-seller-card city">
                <div className="ad-seller-card-header">
                  <span className="ad-seller-icon">🛒</span>
                  <div>
                    <p className="ad-seller-type">City Sellers</p>
                    <h3 className="ad-seller-count">{citySellers.length}</h3>
                  </div>
                </div>
                <div className="ad-seller-list">
                  {citySellers.length === 0
                    ? <p className="ad-empty-txt">Koi seller nahi</p>
                    : citySellers.map(s => (
                      <div key={s._id} className="ad-seller-row">
                        <span className="ad-seller-name">{s.name || "—"}</span>
                        <span className="ad-loc-pill city">📍 {s.location || "—"}</span>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className="ad-seller-card thok">
                <div className="ad-seller-card-header">
                  <span className="ad-seller-icon">🏭</span>
                  <div>
                    <p className="ad-seller-type">Thok Mandi Sellers</p>
                    <h3 className="ad-seller-count">{thokSellers.length}</h3>
                  </div>
                </div>
                <div className="ad-seller-list">
                  {thokSellers.length === 0
                    ? <p className="ad-empty-txt">Koi seller nahi</p>
                    : thokSellers.map(s => (
                      <div key={s._id} className="ad-seller-row">
                        <span className="ad-seller-name">{s.name || "—"}</span>
                        <span className="ad-loc-pill thok">🏭 {s.location || "—"}</span>
                      </div>
                    ))
                  }
                </div>
              </div>

            </div>
          </section>

          {/* ── SALES GRAPH */}
          <section className="ad-section">
            <h2 className="ad-section-title">📈 Sales Graph</h2>
            <div className="ad-graph-card">
              <GraphBar label="Total Orders" value={data.totalOrders || 0} max={maxVal} color="#22c55e" />
              <GraphBar label="Aaj Ke Orders" value={data.today || 0}        max={maxVal} color="#3b82f6" />
              <GraphBar label="Total Sales ₹" value={data.totalSales || 0}  max={Math.max(data.totalSales || 0, 1)} color="#f59e0b" />
            </div>
          </section>

          {/* ── PENDING ORDERS */}
          <section className="ad-section">
            <div className="ad-section-head">
              <div>
                <h2 className="ad-section-title" style={{ margin: 0 }}>⏳ Pending Orders</h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="ad-badge yellow">{pending.length} pending</span>
                <button className="ad-toggle-btn yellow" onClick={() => setShowPending(p => !p)}>
                  {showPending ? "▲ Hide" : "▼ Show"}
                </button>
              </div>
            </div>

            {showPending && (
              pending.length === 0
                ? <p className="ad-empty-txt" style={{ marginTop: 12 }}>Koi pending order nahi.</p>
                : <div className="ad-orders-list">
                    {pending.map(o => <OrderCard key={o._id} o={o} type="pending" fmtDateTime={fmtDateTime} />)}
                  </div>
            )}
          </section>

          {/* ── DELIVERED ORDERS */}
          <section className="ad-section">
            <div className="ad-section-head">
              <div>
                <h2 className="ad-section-title" style={{ margin: 0 }}>✅ Delivered Orders History</h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="ad-badge green">{delivered.length} total</span>
                <button className="ad-toggle-btn green" onClick={() => setShowDelivered(p => !p)}>
                  {showDelivered ? "▲ Hide" : "▼ Show"}
                </button>
              </div>
            </div>

            {showDelivered && (
              delivered.length === 0
                ? <p className="ad-empty-txt" style={{ marginTop: 12 }}>Koi delivered order nahi abhi tak.</p>
                : <div className="ad-orders-list">
                    {delivered.map(o => <OrderCard key={o._id} o={o} type="delivered" fmtDateTime={fmtDateTime} />)}
                  </div>
            )}
          </section>

        </div>
      </div>
    </>
  );
}

function HeroStat({ label, value, color }) {
  return (
    <div className="ad-hero-stat">
      <div className="ad-hero-stat-val" style={{ color }}>{value}</div>
      <div className="ad-hero-stat-lbl">{label}</div>
    </div>
  );
}

function GraphBar({ label, value, max, color }) {
  const pct = max ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="ad-graph-bar-wrap">
      <div className="ad-graph-bar-bg">
        <div className="ad-graph-bar-fill" style={{ height: pct + "%", background: color }} />
      </div>
      <div className="ad-graph-val" style={{ color }}>{value}</div>
      <div className="ad-graph-lbl">{label}</div>
    </div>
  );
}

function OrderCard({ o, type, fmtDateTime }) {
  const allSellers = [...(o.citySellers || []), ...(o.thokSellers || [])].filter(s => s.name || s.phone);
  const isDelivered = type === "delivered";
  return (
    <div className={`ad-order-card ${isDelivered ? "delivered" : "pending"}`}>

      {/* Header */}
      <div className="ad-order-header">
        <div>
          <span className="ad-order-dt">{fmtDateTime(o.createdAt)}</span>
          {o.location && <span className="ad-order-loc">📍 {o.location}</span>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="ad-order-total">₹{o.totalPrice}</div>
          <span className={`ad-status-pill ${isDelivered ? "green" : "yellow"}`}>
            {isDelivered ? "✅ Delivered" : "⏳ Pending"}
          </span>
        </div>
      </div>

      <div className="ad-order-divider" />

      {/* 3-col grid */}
      <div className="ad-order-grid">

        {/* Buyer */}
        <div className="ad-info-block">
          <p className="ad-info-label">👤 Buyer</p>
          <p className="ad-info-name">{o.name || "—"}</p>
          <p className="ad-info-phone">📞 {o.phone || "—"}</p>
          {o.address && <p className="ad-info-addr">🏠 {o.address}</p>}
        </div>

        {/* Sellers */}
        <div className="ad-info-block">
          <p className="ad-info-label">🧑‍🌾 Seller(s)</p>
          {allSellers.length === 0
            ? <p className="ad-empty-txt">Info nahi</p>
            : allSellers.map((s, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <p className="ad-info-name">{s.name || "—"}</p>
                {s.phone && <p className="ad-info-phone">📞 {s.phone}</p>}
              </div>
            ))
          }
        </div>

        {/* Items */}
        <div className="ad-info-block">
          <p className="ad-info-label">📦 Items</p>
          {(o.items || []).map((x, i) => (
            <p key={i} className="ad-info-item">• {x.name} × {x.qty}</p>
          ))}
          <div className="ad-amt-row">
            <span className="ad-amt-tag yellow">Adv: ₹{o.advancePaid || 0}</span>
            <span className="ad-amt-tag orange">Baaki: ₹{o.totalPrice - (o.advancePaid || 0)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Nunito:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

  .ad-root { min-height:100vh; background:#f1f5f9; font-family:'Nunito',sans-serif; }

  /* ── HERO */
  .ad-hero {
    background: linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%);
    padding: clamp(28px,4vw,56px) clamp(20px,4vw,56px);
  }
  .ad-hero-inner {
    max-width:1200px; margin:0 auto;
    display:flex; justify-content:space-between;
    align-items:center; flex-wrap:wrap; gap:28px;
  }
  .ad-hero-badge {
    display:inline-block; background:rgba(255,255,255,.12); color:#93c5fd;
    padding:4px 14px; border-radius:100px; font-size:12px; font-weight:700;
    letter-spacing:1px; margin-bottom:12px;
  }
  .ad-hero-title {
    font-family:'Playfair Display',serif;
    font-size:clamp(30px,5vw,48px); color:#fff; margin-bottom:6px;
  }
  .ad-hero-sub { font-size:14px; color:rgba(255,255,255,.5); }

  .ad-hero-stats { display:flex; gap:16px; flex-wrap:wrap; }
  .ad-hero-stat {
    background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
    border-radius:18px; padding:18px 28px; text-align:center; min-width:110px;
    backdrop-filter:blur(10px);
  }
  .ad-hero-stat-val { font-size:28px; font-weight:800; font-family:'Playfair Display',serif; }
  .ad-hero-stat-lbl { font-size:11px; color:rgba(255,255,255,.55); font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-top:4px; }

  /* ── BODY */
  .ad-body { max-width:1200px; margin:0 auto; padding:clamp(24px,3vw,48px) clamp(16px,3vw,40px); }

  /* ── SECTION */
  .ad-section { margin-bottom:40px; animation:fadeUp 0.4s ease both; }
  .ad-section-title { font-size:18px; font-weight:800; color:#0f172a; margin-bottom:16px; }
  .ad-section-head {
    display:flex; justify-content:space-between;
    align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;
  }

  /* ── SELLERS */
  .ad-sellers-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:16px; }
  .ad-seller-card {
    background:#fff; border-radius:18px; padding:20px 22px;
    box-shadow:0 4px 16px rgba(0,0,0,.06);
    border-top:4px solid transparent;
  }
  .ad-seller-card.city { border-top-color:#22c55e; }
  .ad-seller-card.thok { border-top-color:#f97316; }
  .ad-seller-card-header { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
  .ad-seller-icon { font-size:32px; }
  .ad-seller-type  { font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; }
  .ad-seller-count { font-size:36px; font-weight:800; color:#0f172a; font-family:'Playfair Display',serif; }
  .ad-seller-list  { display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto; }
  .ad-seller-row   { display:flex; justify-content:space-between; align-items:center; gap:8px; padding:8px 12px; background:#f8fafc; border-radius:10px; flex-wrap:wrap; }
  .ad-seller-name  { font-weight:700; font-size:14px; color:#1a1a1a; }
  .ad-loc-pill     { font-size:12px; font-weight:600; padding:3px 10px; border-radius:100px; }
  .ad-loc-pill.city  { background:#f0fdf4; color:#16a34a; border:1px solid #c6e8c6; }
  .ad-loc-pill.thok  { background:#fff7ed; color:#f97316; border:1px solid #fed7aa; }

  /* ── GRAPH */
  .ad-graph-card {
    background:#fff; border-radius:18px;
    padding:clamp(20px,3vw,36px);
    box-shadow:0 4px 16px rgba(0,0,0,.06);
    display:flex; justify-content:space-around; align-items:flex-end;
    gap:20px; min-height:240px;
  }
  .ad-graph-bar-wrap { display:flex; flex-direction:column; align-items:center; gap:8px; flex:1; max-width:120px; }
  .ad-graph-bar-bg   { width:48px; height:160px; background:#e2e8f0; border-radius:12px; overflow:hidden; display:flex; align-items:flex-end; }
  .ad-graph-bar-fill { width:100%; border-radius:12px; transition:height 0.6s ease; }
  .ad-graph-val { font-size:18px; font-weight:800; }
  .ad-graph-lbl { font-size:12px; color:#64748b; font-weight:600; text-align:center; }

  /* ── BADGES & BUTTONS */
  .ad-badge { font-size:13px; font-weight:700; padding:4px 12px; border-radius:999px; }
  .ad-badge.yellow { background:#fef3c7; color:#92400e; }
  .ad-badge.green  { background:#dcfce7; color:#166534; }
  .ad-toggle-btn {
    padding:8px 18px; border:none; border-radius:10px;
    font-family:'Nunito',sans-serif; font-weight:700; font-size:13px; cursor:pointer;
  }
  .ad-toggle-btn.yellow { background:#92400e; color:#fff; }
  .ad-toggle-btn.green  { background:#166534; color:#fff; }

  /* ── ORDER CARDS */
  .ad-orders-list { display:flex; flex-direction:column; gap:14px; }
  .ad-order-card {
    background:#fff; border-radius:18px;
    padding:clamp(16px,2.5vw,24px);
    box-shadow:0 4px 16px rgba(0,0,0,.06);
    border-left:4px solid transparent;
    animation:fadeUp 0.3s ease both;
  }
  .ad-order-card.pending   { border-left-color:#f59e0b; }
  .ad-order-card.delivered { border-left-color:#22c55e; }

  .ad-order-header {
    display:flex; justify-content:space-between;
    align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:14px;
  }
  .ad-order-dt  { font-size:13px; font-weight:700; color:#374151; margin-right:8px; }
  .ad-order-loc { font-size:12px; color:#64748b; background:#f1f5f9; padding:2px 8px; border-radius:999px; }
  .ad-order-total { font-size:20px; font-weight:800; color:#0f172a; }
  .ad-status-pill { font-size:12px; font-weight:700; padding:4px 12px; border-radius:999px; display:inline-block; margin-top:4px; }
  .ad-status-pill.green  { background:#dcfce7; color:#166534; }
  .ad-status-pill.yellow { background:#fef3c7; color:#92400e; }

  .ad-order-divider { height:1px; background:#f1f5f9; margin-bottom:14px; }

  .ad-order-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:12px; }

  .ad-info-block { background:#f8fafc; border-radius:12px; padding:12px 14px; }
  .ad-info-label { font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
  .ad-info-name  { font-size:14px; font-weight:700; color:#1a1a1a; margin-bottom:3px; }
  .ad-info-phone { font-size:13px; color:#2563eb; font-weight:600; margin-bottom:3px; }
  .ad-info-addr  { font-size:12px; color:#64748b; }
  .ad-info-item  { font-size:13px; color:#475569; margin-bottom:4px; }

  .ad-amt-row    { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
  .ad-amt-tag    { font-size:12px; font-weight:700; padding:3px 10px; border-radius:999px; }
  .ad-amt-tag.yellow { background:#fef3c7; color:#92400e; }
  .ad-amt-tag.orange { background:#fff7ed; color:#c2410c; }

  .ad-empty-txt { font-size:13px; color:#aaa; }
`;
