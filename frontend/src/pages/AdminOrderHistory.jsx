import { useEffect, useState, useMemo } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Nunito:wght@400;500;600;700&display=swap');

  .aoh-root {
    min-height: 100vh;
    background: #0d1117;
    font-family: 'Nunito', sans-serif;
    padding-bottom: 60px;
  }

  /* ── Hero ── */
  .aoh-hero {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2027 100%);
    padding: 48px 24px 36px;
    position: relative;
    overflow: hidden;
    border-bottom: 1px solid rgba(99,179,237,.12);
  }
  .aoh-hero::before {
    content: '';
    position: absolute;
    top: -80px; left: -80px;
    width: 340px; height: 340px;
    background: radial-gradient(circle, rgba(99,179,237,.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .aoh-hero::after {
    content: '';
    position: absolute;
    bottom: -60px; right: -60px;
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(139,92,246,.10) 0%, transparent 70%);
    pointer-events: none;
  }
  .aoh-hero-inner {
    max-width: 1100px;
    margin: 0 auto;
    position: relative; z-index: 1;
  }
  .aoh-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(99,179,237,.15);
    border: 1px solid rgba(99,179,237,.25);
    color: #63b3ed;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 20px;
    margin-bottom: 14px;
  }
  .aoh-hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(26px, 4vw, 40px);
    color: #fff;
    margin: 0 0 6px;
    line-height: 1.2;
  }
  .aoh-hero p {
    color: #94a3b8;
    font-size: 15px;
    margin: 0 0 28px;
  }

  /* Stats row */
  .aoh-stats {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }
  .aoh-stat {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 14px;
    padding: 14px 22px;
    min-width: 120px;
  }
  .aoh-stat-val {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    color: #fff;
    line-height: 1;
  }
  .aoh-stat-lbl {
    font-size: 12px;
    color: #64748b;
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: .8px;
  }

  /* ── Filters bar ── */
  .aoh-filters {
    max-width: 1100px;
    margin: 28px auto 0;
    padding: 0 24px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }
  .aoh-search {
    flex: 1;
    min-width: 220px;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 12px;
    padding: 11px 16px 11px 42px;
    color: #e6edf3;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color .2s;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: 14px center;
  }
  .aoh-search:focus { border-color: #63b3ed; }

  .aoh-filter-btn {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 10px;
    color: #8b949e;
    font-family: 'Nunito', sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 16px;
    cursor: pointer;
    transition: all .2s;
  }
  .aoh-filter-btn:hover { border-color: #63b3ed; color: #63b3ed; }
  .aoh-filter-btn.active {
    background: rgba(99,179,237,.15);
    border-color: #63b3ed;
    color: #63b3ed;
  }
  .aoh-filter-btn.del.active {
    background: rgba(52,211,153,.12);
    border-color: #34d399;
    color: #34d399;
  }
  .aoh-filter-btn.pend.active {
    background: rgba(251,191,36,.12);
    border-color: #fbbf24;
    color: #fbbf24;
  }

  .aoh-date-input {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 10px;
    color: #8b949e;
    font-family: 'Nunito', sans-serif;
    font-size: 13px;
    padding: 10px 14px;
    outline: none;
    cursor: pointer;
    transition: border-color .2s;
  }
  .aoh-date-input:focus { border-color: #63b3ed; color: #e6edf3; }

  /* ── Results count ── */
  .aoh-count {
    max-width: 1100px;
    margin: 18px auto 0;
    padding: 0 24px;
    color: #64748b;
    font-size: 13px;
    font-weight: 600;
  }

  /* ── Orders list ── */
  .aoh-list {
    max-width: 1100px;
    margin: 14px auto 0;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ── Order Card ── */
  .aoh-card {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 16px;
    overflow: hidden;
    transition: border-color .2s, transform .2s;
  }
  .aoh-card:hover { border-color: #63b3ed44; transform: translateY(-1px); }
  .aoh-card.delivered { border-left: 4px solid #34d399; }
  .aoh-card.pending   { border-left: 4px solid #fbbf24; }

  /* Card top bar */
  .aoh-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    background: rgba(255,255,255,.025);
    border-bottom: 1px solid #30363d;
    gap: 12px;
    flex-wrap: wrap;
  }
  .aoh-order-id {
    font-family: 'Playfair Display', serif;
    font-size: 13px;
    color: #64748b;
    letter-spacing: .5px;
  }
  .aoh-order-id span {
    color: #8b949e;
    font-family: 'Nunito', sans-serif;
    font-size: 11px;
  }
  .aoh-datetime {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #94a3b8;
    font-size: 13px;
  }
  .aoh-datetime-date { font-weight: 700; color: #e6edf3; }
  .aoh-datetime-time {
    background: rgba(99,179,237,.1);
    color: #63b3ed;
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 700;
  }
  .aoh-status-badge {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 20px;
  }
  .aoh-status-badge.pending {
    background: rgba(251,191,36,.15);
    color: #fbbf24;
    border: 1px solid rgba(251,191,36,.3);
  }
  .aoh-status-badge.delivered {
    background: rgba(52,211,153,.12);
    color: #34d399;
    border: 1px solid rgba(52,211,153,.25);
  }

  /* Card body 3 columns */
  .aoh-card-body {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0;
  }
  .aoh-col {
    padding: 18px 20px;
    border-right: 1px solid #30363d;
  }
  .aoh-col:last-child { border-right: none; }
  .aoh-col-title {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #4b5563;
    margin-bottom: 12px;
  }

  /* Buyer col */
  .aoh-buyer-name {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    color: #e6edf3;
    margin-bottom: 4px;
  }
  .aoh-buyer-phone {
    color: #63b3ed;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    display: block;
    margin-bottom: 6px;
  }
  .aoh-buyer-phone:hover { text-decoration: underline; }
  .aoh-buyer-addr {
    color: #64748b;
    font-size: 12px;
    line-height: 1.4;
    margin-bottom: 6px;
  }
  .aoh-buyer-city {
    display: inline-block;
    background: rgba(139,92,246,.12);
    color: #a78bfa;
    border: 1px solid rgba(139,92,246,.2);
    font-size: 11px;
    font-weight: 700;
    border-radius: 6px;
    padding: 2px 8px;
  }
  .aoh-uid {
    color: #374151;
    font-size: 10px;
    font-family: monospace;
    margin-top: 6px;
    word-break: break-all;
  }

  /* Items col */
  .aoh-item-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #1e2532;
  }
  .aoh-item-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
  .aoh-item-img {
    width: 38px; height: 38px;
    border-radius: 8px;
    object-fit: cover;
    background: #1e2532;
    flex-shrink: 0;
  }
  .aoh-item-info { flex: 1; min-width: 0; }
  .aoh-item-name {
    color: #cbd5e1;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .aoh-item-qty {
    color: #64748b;
    font-size: 12px;
    margin-top: 2px;
  }
  .aoh-item-price {
    font-family: 'Playfair Display', serif;
    color: #34d399;
    font-size: 14px;
    flex-shrink: 0;
  }

  /* Payment col */
  .aoh-pay-box {
    background: rgba(255,255,255,.03);
    border: 1px solid #30363d;
    border-radius: 10px;
    padding: 10px 14px;
    margin-bottom: 8px;
  }
  .aoh-pay-box:last-child { margin-bottom: 0; }
  .aoh-pay-lbl { color: #4b5563; font-size: 11px; text-transform: uppercase; letter-spacing: .8px; }
  .aoh-pay-val {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    color: #e6edf3;
    margin-top: 2px;
  }
  .aoh-pay-val.green { color: #34d399; }
  .aoh-pay-val.yellow { color: #fbbf24; }
  .aoh-pay-val.red { color: #f87171; }

  /* Seller footer */
  .aoh-seller-footer {
    padding: 12px 20px;
    background: rgba(255,255,255,.015);
    border-top: 1px solid #30363d;
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .aoh-seller-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,.04);
    border: 1px solid #30363d;
    border-radius: 10px;
    padding: 7px 12px;
  }
  .aoh-seller-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .aoh-seller-dot.city { background: #34d399; }
  .aoh-seller-dot.thok { background: #fb923c; }
  .aoh-seller-name { color: #94a3b8; font-size: 13px; font-weight: 600; }
  .aoh-seller-phone {
    color: #63b3ed;
    font-size: 12px;
    text-decoration: none;
  }
  .aoh-seller-phone:hover { text-decoration: underline; }
  .aoh-seller-type {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .8px;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 5px;
  }
  .aoh-seller-type.city {
    background: rgba(52,211,153,.12);
    color: #34d399;
  }
  .aoh-seller-type.thok {
    background: rgba(251,146,60,.12);
    color: #fb923c;
  }

  /* Empty state */
  .aoh-empty {
    max-width: 1100px;
    margin: 60px auto;
    padding: 0 24px;
    text-align: center;
  }
  .aoh-empty-icon { font-size: 56px; margin-bottom: 16px; }
  .aoh-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: #e6edf3;
    margin-bottom: 8px;
  }
  .aoh-empty-sub { color: #4b5563; font-size: 14px; }

  /* Loading skeleton */
  .aoh-skel-card {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 16px;
    overflow: hidden;
  }
  .aoh-skel-top {
    height: 52px;
    background: rgba(255,255,255,.025);
    border-bottom: 1px solid #30363d;
  }
  .aoh-skel-body {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding: 18px 20px;
    gap: 20px;
  }
  .aoh-skel-line {
    border-radius: 6px;
    background: linear-gradient(90deg, #1e2532 25%, #2d3748 50%, #1e2532 75%);
    background-size: 200% 100%;
    animation: aohShimmer 1.4s infinite;
  }
  @keyframes aohShimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Expand toggle ── */
  .aoh-toggle-btn {
    width: 100%;
    background: none;
    border: none;
    border-top: 1px solid #30363d;
    color: #4b5563;
    font-family: 'Nunito', sans-serif;
    font-size: 12px;
    font-weight: 600;
    padding: 8px;
    cursor: pointer;
    transition: color .2s, background .2s;
    letter-spacing: .5px;
  }
  .aoh-toggle-btn:hover { color: #63b3ed; background: rgba(99,179,237,.04); }

  @media (max-width: 700px) {
    .aoh-card-body { grid-template-columns: 1fr; }
    .aoh-col { border-right: none; border-bottom: 1px solid #30363d; }
    .aoh-col:last-child { border-bottom: none; }
    .aoh-card-top { flex-direction: column; align-items: flex-start; }
  }
`;

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("hi-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function baaki(order) {
  return Math.max(0, (order.totalPrice || 0) - (order.advancePaid || 0));
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  const allSellers = [
    ...(order.citySellers || []).map(s => ({ ...s, type: "city" })),
    ...(order.thokSellers || []).map(s => ({ ...s, type: "thok" })),
  ];

  const visibleItems = expanded ? order.items : order.items?.slice(0, 3);

  return (
    <div className={`aoh-card ${order.status}`}>
      {/* Top bar */}
      <div className="aoh-card-top">
        <div>
          <div className="aoh-order-id">
            Order <span>#{order._id?.slice(-8).toUpperCase()}</span>
          </div>
        </div>
        <div className="aoh-datetime">
          <span className="aoh-datetime-date">{formatDate(order.createdAt)}</span>
          <span className="aoh-datetime-time">{formatTime(order.createdAt)}</span>
        </div>
        <span className={`aoh-status-badge ${order.status}`}>
          {order.status === "delivered" ? "✓ Delivered" : "⏳ Pending"}
        </span>
      </div>

      {/* 3-col body */}
      <div className="aoh-card-body">
        {/* Buyer */}
        <div className="aoh-col">
          <div className="aoh-col-title">👤 Buyer Info</div>
          <div className="aoh-buyer-name">{order.name || "—"}</div>
          {order.phone && (
            <a href={`tel:${order.phone}`} className="aoh-buyer-phone">📞 {order.phone}</a>
          )}
          <div className="aoh-buyer-addr">{order.address || "—"}</div>
          {order.location && <span className="aoh-buyer-city">📍 {order.location}</span>}
          <div className="aoh-uid">{order.uid}</div>
        </div>

        {/* Items */}
        <div className="aoh-col">
          <div className="aoh-col-title">🛒 Items ({order.items?.length || 0})</div>
          {visibleItems?.map((item, i) => (
            <div className="aoh-item-row" key={i}>
              {item.imageUrl
                ? <img src={item.imageUrl} alt="" className="aoh-item-img" />
                : <div className="aoh-item-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🥬</div>
              }
              <div className="aoh-item-info">
                <div className="aoh-item-name">{item.name || item.productName || "Product"}</div>
                <div className="aoh-item-qty">Qty: {item.qty || 1}</div>
              </div>
              <div className="aoh-item-price">₹{item.price || 0}</div>
            </div>
          ))}
          {(order.items?.length || 0) > 3 && (
            <button className="aoh-toggle-btn" onClick={() => setExpanded(e => !e)}>
              {expanded ? "▲ Kam dikhao" : `▼ +${order.items.length - 3} aur items`}
            </button>
          )}
        </div>

        {/* Payment */}
        <div className="aoh-col">
          <div className="aoh-col-title">💰 Payment</div>
          <div className="aoh-pay-box">
            <div className="aoh-pay-lbl">Total</div>
            <div className="aoh-pay-val">₹{order.totalPrice || 0}</div>
          </div>
          <div className="aoh-pay-box">
            <div className="aoh-pay-lbl">Advance Mila</div>
            <div className="aoh-pay-val green">₹{order.advancePaid || 0}</div>
          </div>
          <div className="aoh-pay-box">
            <div className="aoh-pay-lbl">Baaki Milna</div>
            <div className={`aoh-pay-val ${baaki(order) > 0 ? "red" : "green"}`}>
              ₹{baaki(order)}
            </div>
          </div>
        </div>
      </div>

      {/* Seller footer */}
      {allSellers.length > 0 && (
        <div className="aoh-seller-footer">
          {allSellers.map((s, i) => (
            <div className="aoh-seller-chip" key={i}>
              <div className={`aoh-seller-dot ${s.type}`}></div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="aoh-seller-name">{s.name || "Seller"}</span>
                  <span className={`aoh-seller-type ${s.type}`}>
                    {s.type === "city" ? "City" : "Thok"}
                  </span>
                </div>
                {s.phone && (
                  <a href={`tel:${s.phone}`} className="aoh-seller-phone">📞 {s.phone}</a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="aoh-skel-card">
      <div className="aoh-skel-top" />
      <div className="aoh-skel-body">
        {[0,1,2].map(i => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="aoh-skel-line" style={{ height: 16, width: "60%" }} />
            <div className="aoh-skel-line" style={{ height: 12, width: "80%" }} />
            <div className="aoh-skel-line" style={{ height: 12, width: "50%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminOrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/orders/admin`),
      axios.get(`${API}/api/orders/admin/delivered`),
    ])
      .then(([pendingRes, deliveredRes]) => {
        const pending   = Array.isArray(pendingRes.data)   ? pendingRes.data   : [];
        const delivered = Array.isArray(deliveredRes.data) ? deliveredRes.data : [];
        const merged = [...pending, ...delivered].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(merged);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = orders;

    if (statusFilter !== "all") {
      result = result.filter(o => o.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(o => {
        const buyerMatch = (o.name || "").toLowerCase().includes(q) ||
                           (o.phone || "").includes(q) ||
                           (o.address || "").toLowerCase().includes(q) ||
                           (o.uid || "").toLowerCase().includes(q);
        const sellerMatch = [...(o.citySellers || []), ...(o.thokSellers || [])]
          .some(s => (s.name || "").toLowerCase().includes(q) || (s.phone || "").includes(q));
        const itemMatch = (o.items || []).some(i =>
          (i.name || i.productName || "").toLowerCase().includes(q)
        );
        return buyerMatch || sellerMatch || itemMatch;
      });
    }

    if (fromDate) {
      const from = new Date(fromDate);
      result = result.filter(o => new Date(o.createdAt) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      result = result.filter(o => new Date(o.createdAt) <= to);
    }

    return result;
  }, [orders, search, statusFilter, fromDate, toDate]);

  const totalRevenue = useMemo(() =>
    orders.reduce((s, o) => s + (o.totalPrice || 0), 0), [orders]);
  const totalAdvance = useMemo(() =>
    orders.reduce((s, o) => s + (o.advancePaid || 0), 0), [orders]);
  const totalBaaki = useMemo(() =>
    orders.reduce((s, o) => s + baaki(o), 0), [orders]);

  return (
    <div className="aoh-root">
      <style>{css}</style>

      {/* Hero */}
      <div className="aoh-hero">
        <div className="aoh-hero-inner">
          <div className="aoh-hero-badge">📋 Admin</div>
          <h1>Order History</h1>
          <p>Saari zindagi ke saare orders — buyer info, seller info, date/time ke saath</p>

          <div className="aoh-stats">
            <div className="aoh-stat">
              <div className="aoh-stat-val">{orders.length}</div>
              <div className="aoh-stat-lbl">Total Orders</div>
            </div>
            <div className="aoh-stat">
              <div className="aoh-stat-val">{orders.filter(o => o.status === "pending").length}</div>
              <div className="aoh-stat-lbl">Pending</div>
            </div>
            <div className="aoh-stat">
              <div className="aoh-stat-val">{orders.filter(o => o.status === "delivered").length}</div>
              <div className="aoh-stat-lbl">Delivered</div>
            </div>
            <div className="aoh-stat">
              <div className="aoh-stat-val" style={{ color: "#34d399" }}>₹{totalRevenue.toLocaleString()}</div>
              <div className="aoh-stat-lbl">Total Revenue</div>
            </div>
            <div className="aoh-stat">
              <div className="aoh-stat-val" style={{ color: "#34d399" }}>₹{totalAdvance.toLocaleString()}</div>
              <div className="aoh-stat-lbl">Advance Mila</div>
            </div>
            <div className="aoh-stat">
              <div className="aoh-stat-val" style={{ color: "#f87171" }}>₹{totalBaaki.toLocaleString()}</div>
              <div className="aoh-stat-lbl">Baaki Milna</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="aoh-filters">
        <input
          className="aoh-search"
          placeholder="Buyer naam, phone, seller naam, product dhundo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          className={`aoh-filter-btn ${statusFilter === "all" ? "active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >Sabhi</button>
        <button
          className={`aoh-filter-btn pend ${statusFilter === "pending" ? "active" : ""}`}
          onClick={() => setStatusFilter("pending")}
        >⏳ Pending</button>
        <button
          className={`aoh-filter-btn del ${statusFilter === "delivered" ? "active" : ""}`}
          onClick={() => setStatusFilter("delivered")}
        >✓ Delivered</button>
        <input
          type="date"
          className="aoh-date-input"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          title="From date"
        />
        <input
          type="date"
          className="aoh-date-input"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          title="To date"
        />
        {(fromDate || toDate || search || statusFilter !== "all") && (
          <button
            className="aoh-filter-btn"
            onClick={() => { setSearch(""); setStatusFilter("all"); setFromDate(""); setToDate(""); }}
          >✕ Reset</button>
        )}
      </div>

      {/* Count */}
      {!loading && (
        <div className="aoh-count">
          {filtered.length === orders.length
            ? `${orders.length} orders`
            : `${filtered.length} / ${orders.length} orders mil rahe hain`}
        </div>
      )}

      {/* List */}
      <div className="aoh-list">
        {loading ? (
          [1,2,3].map(i => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div className="aoh-empty">
            <div className="aoh-empty-icon">📭</div>
            <div className="aoh-empty-title">Koi order nahi mila</div>
            <div className="aoh-empty-sub">Filter ya search badlo</div>
          </div>
        ) : (
          filtered.map(o => <OrderCard key={o._id} order={o} />)
        )}
      </div>
    </div>
  );
}
