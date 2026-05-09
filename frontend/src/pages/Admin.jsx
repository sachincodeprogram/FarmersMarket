import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Nunito:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes popIn   { from { opacity:0; transform:scale(.94); } to { opacity:1; transform:scale(1); } }

  .adm-wrap { min-height:100vh; background:#f0f4f8; font-family:'Nunito',sans-serif; }

  /* ── HERO ── */
  .adm-hero {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #0f172a 100%);
    padding: 36px 24px 52px;
    position: relative; overflow: hidden;
  }
  .adm-hero::before {
    content:''; position:absolute; inset:0;
    background: radial-gradient(ellipse at 75% 40%, rgba(59,130,246,.14) 0%, transparent 60%),
                radial-gradient(ellipse at 15% 70%, rgba(99,102,241,.1) 0%, transparent 55%);
    pointer-events:none;
  }
  .adm-hero-inner { max-width:960px; margin:0 auto; position:relative; z-index:1; }
  .adm-hero-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.18);
    color:#bfdbfe; font-size:12px; font-weight:700; letter-spacing:.07em;
    padding:5px 14px; border-radius:100px; margin-bottom:14px;
  }
  .adm-hero-title {
    font-family:'Playfair Display',serif;
    font-size:clamp(26px,4vw,38px); font-weight:800;
    color:#fff; margin-bottom:6px; line-height:1.15;
  }
  .adm-hero-sub { color:rgba(255,255,255,.5); font-size:14px; margin-bottom:30px; }

  /* Hero stat cards */
  .adm-hero-stats { display:flex; gap:14px; flex-wrap:wrap; }
  .adm-hstat {
    flex:1; min-width:120px;
    background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
    border-radius:16px; padding:16px 20px;
    backdrop-filter:blur(6px); text-align:center;
  }
  .adm-hstat-val {
    font-family:'Playfair Display',serif;
    font-size:28px; font-weight:800; color:#fff; line-height:1;
  }
  .adm-hstat-lbl { font-size:11px; color:rgba(255,255,255,.5); font-weight:700; margin-top:5px; letter-spacing:.06em; text-transform:uppercase; }

  /* ── BODY ── */
  .adm-body { max-width:960px; margin:0 auto; padding:28px 20px 48px; }

  /* Section header */
  .adm-section-hdr {
    display:flex; align-items:center; gap:12px; margin-bottom:18px;
  }
  .adm-section-title {
    font-family:'Playfair Display',serif; font-size:20px; font-weight:800; color:#0f172a;
  }
  .adm-section-badge {
    font-family:'Nunito',sans-serif; font-size:13px; font-weight:700;
    padding:4px 13px; border-radius:100px;
  }

  /* Empty state */
  .adm-empty {
    text-align:center; padding:60px 20px;
    background:#fff; border-radius:20px;
    box-shadow:0 2px 12px rgba(0,0,0,.06);
    animation:fadeUp .4s ease;
  }
  .adm-empty-icon { font-size:52px; margin-bottom:14px; display:block; }
  .adm-empty-title { font-family:'Playfair Display',serif; font-size:20px; color:#1e293b; margin-bottom:8px; }
  .adm-empty-sub { color:#6b7280; font-size:14px; }

  /* Loading */
  .adm-loading {
    display:flex; flex-direction:column; align-items:center; gap:14px;
    padding:80px 20px; color:#6b7280; font-size:15px;
  }
  .adm-spinner {
    width:40px; height:40px; border:4px solid #e5e7eb;
    border-top-color:#3b82f6; border-radius:50%; animation:spin .75s linear infinite;
  }

  /* ── ORDER CARD ── */
  .adm-order {
    background:#fff; border-radius:20px;
    box-shadow:0 3px 14px rgba(0,0,0,.07);
    border:1px solid rgba(0,0,0,.05);
    border-left:5px solid #f59e0b;
    margin-bottom:20px;
    animation:fadeUp .4s ease both;
    overflow:hidden;
    transition:box-shadow .2s, transform .2s;
  }
  .adm-order:hover { box-shadow:0 8px 28px rgba(0,0,0,.12); transform:translateY(-2px); }
  .adm-order.thok { border-left-color:#f97316; }

  /* Order header */
  .adm-order-head {
    display:flex; justify-content:space-between; align-items:flex-start;
    flex-wrap:wrap; gap:14px;
    padding:20px 22px 16px; border-bottom:1.5px solid #f5f5f0;
    background:linear-gradient(135deg,#fffdf5,#fffbeb);
  }
  .adm-order.thok .adm-order-head { background:linear-gradient(135deg,#fffbf5,#fff7ed); }

  .adm-order-num {
    font-size:11px; font-weight:700; letter-spacing:.06em;
    color:#9ca3af; text-transform:uppercase; margin-bottom:4px;
  }
  .adm-order-name {
    font-family:'Playfair Display',serif;
    font-size:18px; font-weight:800; color:#0f172a; margin-bottom:6px;
  }
  .adm-order-meta { display:flex; flex-wrap:wrap; gap:8px; }
  .adm-meta-pill {
    display:inline-flex; align-items:center; gap:5px;
    font-size:12px; font-weight:700; padding:4px 11px; border-radius:100px;
  }

  /* Badges */
  .adm-status-badge { background:#fef3c7; color:#92400e; border:1px solid #fde68a; }
  .adm-city-badge   { background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; }
  .adm-thok-badge   { background:#fff7ed; color:#c2410c; border:1px solid #fed7aa; }

  /* Order body — 3 col grid */
  .adm-order-body { padding:18px 22px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:18px; }
  @media (max-width:640px) { .adm-order-body { grid-template-columns:1fr; } }

  .adm-col-label {
    font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase;
    color:#9ca3af; margin-bottom:10px;
  }

  /* Buyer info */
  .adm-buyer-phone {
    font-size:13px; font-weight:700; color:#0f172a; margin-bottom:4px;
    display:flex; align-items:center; gap:6px;
  }
  .adm-buyer-addr {
    font-size:12px; color:#6b7280; line-height:1.55;
    display:flex; gap:5px;
  }

  /* Items */
  .adm-item-row {
    display:flex; justify-content:space-between;
    font-size:13px; color:#374151; font-weight:600;
    padding:5px 0; border-bottom:1px solid #f5f5f0;
  }
  .adm-item-row:last-child { border-bottom:none; }
  .adm-item-qty { color:#9ca3af; font-weight:700; }

  /* Amount boxes */
  .adm-amounts { display:flex; flex-direction:column; gap:8px; }
  .adm-amount-box {
    display:flex; justify-content:space-between; align-items:center;
    padding:9px 12px; border-radius:10px;
  }
  .adm-amount-box-lbl { font-size:11px; font-weight:700; color:#6b7280; }
  .adm-amount-box-val { font-size:15px; font-weight:800; }

  /* Order footer */
  .adm-order-foot { padding:14px 22px; border-top:1.5px solid #f5f5f0; }
  .adm-deliver-btn {
    width:100%; padding:14px;
    background:linear-gradient(135deg,#16a34a,#22c55e);
    color:#fff; border:none; border-radius:14px;
    font-family:'Nunito',sans-serif; font-size:15px; font-weight:800;
    cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
    box-shadow:0 4px 14px rgba(22,163,74,.3);
    transition:transform .15s, box-shadow .2s, opacity .15s;
  }
  .adm-deliver-btn:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(22,163,74,.4); }
  .adm-deliver-btn:disabled { opacity:.6; cursor:not-allowed; }

  /* Nav quick links */
  .adm-quick-links { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:28px; }
  .adm-quick-btn {
    display:flex; align-items:center; gap:8px;
    padding:11px 18px; border-radius:14px; border:none;
    font-family:'Nunito',sans-serif; font-size:14px; font-weight:700;
    cursor:pointer; text-decoration:none; transition:transform .15s, box-shadow .2s;
  }
  .adm-quick-btn:hover { transform:translateY(-2px); }
`;

export default function Admin() {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [delivering, setDelivering] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/orders/admin`);
      setOrders(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function markDelivered(id) {
    try {
      setDelivering(id);
      await axios.put(`${API}/api/orders/deliver/${id}`);
      await load();
    } finally {
      setDelivering(null);
    }
  }

  const totalItems   = orders.reduce((s, o) => s + o.totalQty, 0);
  const totalAmount  = orders.reduce((s, o) => s + o.totalPrice, 0);
  const totalAdvance = orders.reduce((s, o) => s + (o.advancePaid || 0), 0);
  const totalPending = totalAmount - totalAdvance;

  return (
    <>
      <style>{css}</style>
      <div className="adm-wrap">

        {/* ── HERO ── */}
        <div className="adm-hero">
          <div className="adm-hero-inner">
            <div className="adm-hero-badge">🔐 Admin Panel</div>
            <h1 className="adm-hero-title">Pending Orders</h1>
            <p className="adm-hero-sub">Sabhi pending orders — deliver karo aur track karo</p>

            <div className="adm-hero-stats">
              {[
                { val: orders.length,        lbl: "Orders",       col: "#60a5fa" },
                { val: totalItems,           lbl: "Total Items",  col: "#34d399" },
                { val: `₹${totalAmount}`,    lbl: "Revenue",      col: "#fbbf24" },
                { val: `₹${totalAdvance}`,   lbl: "Advance Mila", col: "#a78bfa" },
                { val: `₹${totalPending}`,   lbl: "Baaki Milna",  col: "#f87171" },
              ].map(s => (
                <div className="adm-hstat" key={s.lbl}>
                  <div className="adm-hstat-val" style={{ color: s.col }}>{s.val}</div>
                  <div className="adm-hstat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="adm-body">

          {/* Quick nav links */}
          <div className="adm-quick-links">
            {[
              { href:"/admin-dashboard", icon:"📊", label:"Dashboard",         bg:"#eff6ff", color:"#1d4ed8", shadow:"rgba(29,78,216,.15)" },
              { href:"/admin-sellers",   icon:"👥", label:"Manage Sellers",    bg:"#f0fdf4", color:"#15803d", shadow:"rgba(22,163,74,.15)"  },
              { href:"/admin-products",  icon:"🌾", label:"Products",          bg:"#fff7ed", color:"#c2410c", shadow:"rgba(249,115,22,.15)" },
              { href:"/admin-add",       icon:"➕", label:"Product Add Karo",  bg:"#faf5ff", color:"#7c3aed", shadow:"rgba(124,58,237,.15)" },
              { href:"/store",               icon:"🏪", label:"Store",             bg:"#fff1f2", color:"#be123c", shadow:"rgba(190,18,60,.15)"  },
              { href:"/admin-order-history", icon:"📋", label:"Order History",    bg:"#f0f9ff", color:"#0369a1", shadow:"rgba(3,105,161,.15)"   },
            ].map(q => (
              <a
                key={q.href} href={q.href}
                className="adm-quick-btn"
                style={{ background: q.bg, color: q.color, boxShadow: `0 4px 14px ${q.shadow}` }}
              >
                {q.icon} {q.label}
              </a>
            ))}
          </div>

          {/* Section header */}
          <div className="adm-section-hdr">
            <span className="adm-section-title">Pending Orders</span>
            <span className="adm-section-badge" style={{ background:"#fef3c7", color:"#92400e", border:"1px solid #fde68a" }}>
              {orders.length} pending
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="adm-loading">
              <div className="adm-spinner" />
              <span>Orders load ho rahe hain...</span>
            </div>
          )}

          {/* Empty */}
          {!loading && orders.length === 0 && (
            <div className="adm-empty">
              <span className="adm-empty-icon">🎉</span>
              <div className="adm-empty-title">Koi Pending Order Nahi!</div>
              <div className="adm-empty-sub">Sabhi orders deliver ho gaye hain.</div>
            </div>
          )}

          {/* Order cards */}
          {!loading && orders.map((o, idx) => {
            const isThok    = o.thokSellers && o.thokSellers.length > 0;
            const pending   = o.totalPrice - (o.advancePaid || 0);
            const isDeliv   = delivering === o._id;

            return (
              <div
                key={o._id}
                className={`adm-order${isThok ? " thok" : ""}`}
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                {/* Card Header */}
                <div className="adm-order-head">
                  <div>
                    <div className="adm-order-num">Order #{String(o._id).slice(-6).toUpperCase()}</div>
                    <div className="adm-order-name">{o.name || "—"}</div>
                    <div className="adm-order-meta">
                      <span className="adm-meta-pill adm-status-badge">⏳ {o.status || "pending"}</span>
                      {isThok
                        ? <span className="adm-meta-pill adm-thok-badge">🏭 Thok Mandi</span>
                        : <span className="adm-meta-pill adm-city-badge">🛒 City Seller</span>
                      }
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:22, fontWeight:800, color:"#0f172a", fontFamily:"'Playfair Display',serif" }}>
                      ₹{o.totalPrice}
                    </div>
                    <div style={{ fontSize:12, color:"#9ca3af", fontWeight:600, marginTop:2 }}>Total Amount</div>
                  </div>
                </div>

                {/* Card Body — 3 cols */}
                <div className="adm-order-body">

                  {/* Col 1 — Buyer */}
                  <div>
                    <div className="adm-col-label">👤 Buyer Info</div>
                    <div className="adm-buyer-phone">📞 {o.phone || "—"}</div>
                    <div className="adm-buyer-addr">🏠 <span>{o.address || "—"}</span></div>
                  </div>

                  {/* Col 2 — Items */}
                  <div>
                    <div className="adm-col-label">📦 Items ({o.totalQty} qty)</div>
                    {(o.items || []).map((x, i) => (
                      <div key={i} className="adm-item-row">
                        <span>{x.name}</span>
                        <span className="adm-item-qty">×{x.qty}</span>
                      </div>
                    ))}
                  </div>

                  {/* Col 3 — Amounts */}
                  <div>
                    <div className="adm-col-label">💰 Payment</div>
                    <div className="adm-amounts">
                      <div className="adm-amount-box" style={{ background:"#f0fdf4" }}>
                        <span className="adm-amount-box-lbl">Total</span>
                        <span className="adm-amount-box-val" style={{ color:"#15803d" }}>₹{o.totalPrice}</span>
                      </div>
                      <div className="adm-amount-box" style={{ background:"#eff6ff" }}>
                        <span className="adm-amount-box-lbl">Advance Mila</span>
                        <span className="adm-amount-box-val" style={{ color:"#1d4ed8" }}>₹{o.advancePaid || 0}</span>
                      </div>
                      <div className="adm-amount-box" style={{ background:"#fff7ed" }}>
                        <span className="adm-amount-box-lbl">Baaki Milna</span>
                        <span className="adm-amount-box-val" style={{ color:"#c2410c" }}>₹{pending}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Card Footer */}
                <div className="adm-order-foot">
                  <button
                    className="adm-deliver-btn"
                    onClick={() => markDelivered(o._id)}
                    disabled={isDeliv}
                  >
                    {isDeliv
                      ? <><span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }} /> Delivering...</>
                      : <>✅ Mark as Delivered</>
                    }
                  </button>
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </>
  );
}
