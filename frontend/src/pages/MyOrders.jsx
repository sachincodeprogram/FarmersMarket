import { useEffect, useState } from "react";
import { auth } from "../firebase";
import axios from "axios";

const API = import.meta.env.VITE_API;

export default function MyOrders() {

  const [orders, setOrders]                     = useState([]);
  const [rewards, setRewards]                   = useState([]);
  const [rewardEarnedCount, setRewardEarnedCount] = useState(0);

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      const res  = await axios.get(`${API}/api/orders/user/${user.uid}`);
      setOrders(res.data.filter(o => o.totalPrice > 0));

      const rRes = await axios.get(`${API}/api/rewards/my/${user.uid}`);
      setRewards(Array.isArray(rRes.data) ? rRes.data : []);

      const cRes = await axios.get(`${API}/api/rewards/count/${user.uid}`);
      setRewardEarnedCount(cRes.data.count || 0);
    });
  }, []);

  function daysAgo(dateStr) {
    const d = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    if (d === 0) return "Aaj";
    if (d === 1) return "1 din pehle";
    return d + " din pehle";
  }

  function fmtDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("hi-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });
  }

  async function orderAgain(o) {
    const { data } = await axios.post(`${API}/api/payment/create-order`, { price: o.totalPrice });
    const options = {
      key: data.key,
      amount: data.total * 100,
      currency: "INR",
      order_id: data.orderId,
      handler: async (response) => {
        await axios.post(`${API}/api/payment/verify`, response);
        await axios.post(`${API}/api/orders/again`, { orderId: o._id });
        alert("Order placed again!");
        window.location.reload();
      }
    };
    new window.Razorpay(options).open();
  }

  // ── Reward progress
  const MILESTONES = [3, 6, 18, 36];
  function getThreshold(n) {
    if (n < MILESTONES.length) return MILESTONES[n];
    let t = 36;
    for (let i = MILESTONES.length; i <= n; i++) t *= 2;
    return t;
  }
  const uniqueDays = new Set(orders.map(o => new Date(o.createdAt).toDateString())).size;
  const nextT      = getThreshold(rewardEarnedCount);
  const daysLeft   = Math.max(0, nextT - uniqueDays);
  const pct        = Math.min((uniqueDays / nextT) * 100, 100);
  const chainEnd   = Math.max(rewardEarnedCount + 1, MILESTONES.length);
  const chain      = Array.from({ length: chainEnd }, (_, i) => getThreshold(i));

  return (
    <>
      <style>{css}</style>
      <div className="mo-root">

        <h2 className="mo-title">📦 My Orders</h2>

        {/* Reward codes */}
        {rewards.length > 0 && (
          <div className="mo-reward-box">
            <p className="mo-reward-title">🎁 Aapke Reward Codes</p>
            <p className="mo-reward-sub">Bag mein "Free Order" section mein code paste karo — advance free!</p>
            {rewards.map(r => (
              <div key={r._id} className="mo-reward-row">
                <span className="mo-reward-code">{r.code}</span>
                <button className="mo-copy-btn" onClick={() => {
                  navigator.clipboard.writeText(r.code);
                  alert("Code copy ho gaya: " + r.code);
                }}>📋 Copy</button>
              </div>
            ))}
          </div>
        )}

        {/* Progress tracker */}
        <div className="mo-progress-box">
          <p className="mo-progress-title">🏆 Reward Progress — Alag Din Pe Order Karo</p>

          <div className="mo-chain">
            {chain.map((t, i) => {
              const done    = uniqueDays >= t;
              const current = t === nextT;
              return (
                <span key={t} className={`mo-chip ${done ? "done" : current ? "current" : "future"}`}>
                  {done ? "✅" : current ? "🎯" : "⏳"} {i + 1}
                </span>
              );
            })}
          </div>

          <p className="mo-chain-legend">
            {chain.map((t, i) => `${i + 1} = ${t} din`).join("  •  ")}
          </p>

          <div className="mo-bar-row">
            <span className="mo-bar-label">📅 Unique Din:</span>
            <div className="mo-bar-bg">
              <div className="mo-bar-fill" style={{
                width: `${pct}%`,
                background: daysLeft === 0 ? "#16a34a" : "#f59e0b"
              }} />
            </div>
            <span className="mo-bar-count">{uniqueDays}/{nextT}</span>
            <span className={`mo-prog-badge ${daysLeft === 0 ? "ready" : "wait"}`}>
              {daysLeft === 0 ? "🎁 Reward Ready!" : `⏳ ${daysLeft} din aur`}
            </span>
          </div>
        </div>

        {/* Order cards */}
        {orders.length === 0 ? (
          <div className="mo-empty">
            <div style={{ fontSize: 56 }}>📭</div>
            <h3>Koi Order Nahi</h3>
            <p>Bag se apna pehla order karo!</p>
            <a href="/" className="mo-empty-btn">Products Dekho →</a>
          </div>
        ) : (
          orders.map(o => (
            <div key={o._id} className={`mo-card ${o.status === "delivered" ? "delivered" : ""}`}>

              {/* Header */}
              <div className="mo-card-header">
                <div>
                  <span className="mo-card-date">{fmtDate(o.createdAt)}</span>
                  <span className="mo-card-ago">{daysAgo(o.createdAt)}</span>
                </div>
                <span className={`mo-status-pill ${o.status === "delivered" ? "green" : "yellow"}`}>
                  {o.status === "delivered" ? "✅ Delivered" : "⏳ Pending"}
                </span>
              </div>

              <div className="mo-divider" />

              {/* Items */}
              <div className="mo-items">
                {o.items.map((x, i) => (
                  <div key={i} className="mo-item">
                    {x.image
                      ? <img src={x.image} alt={x.name} className="mo-item-img" />
                      : <div className="mo-item-img-placeholder">🌿</div>
                    }
                    <div className="mo-item-info">
                      <div className="mo-item-name">{x.name}</div>
                      <div className="mo-item-qty">Qty: {x.qty}</div>
                    </div>
                    <div className="mo-item-price">₹{x.price}</div>
                  </div>
                ))}
              </div>

              {/* Amounts */}
              <div className="mo-amounts">
                <div className="mo-amt-box">
                  <div className="mo-amt-val">₹{o.totalPrice}</div>
                  <div className="mo-amt-lbl">Total</div>
                </div>
                <div className="mo-amt-box green">
                  <div className="mo-amt-val">₹{o.advancePaid || 0}</div>
                  <div className="mo-amt-lbl">Advance Paid</div>
                </div>
                <div className="mo-amt-box orange">
                  <div className="mo-amt-val">₹{o.totalPrice - (o.advancePaid || 0)}</div>
                  <div className="mo-amt-lbl">Delivery Par</div>
                </div>
              </div>

              {/* Thok seller */}
              {o.thokSellers?.length > 0 && (
                <div className="mo-thok-box">
                  <p className="mo-thok-title">🏭 Thok Mandi Seller — Contact Karo</p>
                  {o.thokSellers.map((s, i) => (
                    <div key={i} className="mo-thok-row">
                      <span className="mo-thok-name">👤 {s.name || "Seller"}</span>
                      {s.phone && (
                        <a href={`tel:${s.phone}`} className="mo-thok-phone">📞 {s.phone}</a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              {o.status === "delivered" && (
                <button className="mo-again-btn" onClick={() => orderAgain(o)}>
                  🔁 Order Again (Pay 25%)
                </button>
              )}
              {o.status === "pending" && (
                <p className="mo-pending-txt">🕒 Delivery pending hai</p>
              )}

            </div>
          ))
        )}

      </div>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Nunito:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }

  .mo-root {
    min-height: 100vh;
    background: #f1f5f9;
    padding: clamp(20px,3vw,48px) clamp(16px,3vw,40px);
    max-width: 860px;
    margin: 0 auto;
    font-family: 'Nunito', sans-serif;
  }

  .mo-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(22px,3vw,30px);
    color: #0f172a;
    margin-bottom: 24px;
  }

  /* ── Reward box */
  .mo-reward-box {
    background: #faf5ff;
    border: 1.5px solid #d8b4fe;
    border-radius: 16px;
    padding: 18px 20px;
    margin-bottom: 20px;
    animation: fadeUp 0.3s ease;
  }
  .mo-reward-title { font-weight:800; font-size:15px; color:#7c3aed; margin-bottom:4px; }
  .mo-reward-sub   { font-size:12px; color:#6b7280; margin-bottom:14px; }
  .mo-reward-row   { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
  .mo-reward-code  {
    font-family:monospace; font-size:17px; font-weight:800;
    color:#6d28d9; letter-spacing:2px;
    background:#ede9fe; padding:8px 16px; border-radius:10px;
  }
  .mo-copy-btn {
    padding:8px 14px; background:#7c3aed; color:#fff;
    border:none; border-radius:10px; cursor:pointer; font-weight:700; font-size:13px;
    font-family:'Nunito',sans-serif;
  }

  /* ── Progress box */
  .mo-progress-box {
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: 16px;
    padding: 18px 20px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,.04);
    animation: fadeUp 0.3s ease;
  }
  .mo-progress-title { font-weight:800; font-size:14px; color:#0f172a; margin-bottom:14px; }
  .mo-chain          { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px; }
  .mo-chip {
    padding:5px 14px; border-radius:999px; font-size:13px; font-weight:800;
    border:2px solid transparent; transition:0.3s;
  }
  .mo-chip.done    { background:#dcfce7; color:#166534; }
  .mo-chip.current { background:#fef3c7; color:#92400e; border-color:#f59e0b; }
  .mo-chip.future  { background:#f1f5f9; color:#94a3b8; }
  .mo-chain-legend { font-size:11px; color:#94a3b8; margin-bottom:14px; }
  .mo-bar-row      { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .mo-bar-label    { font-size:13px; font-weight:600; color:#374151; min-width:100px; }
  .mo-bar-bg       { flex:1; min-width:80px; height:10px; background:#e2e8f0; border-radius:999px; overflow:hidden; }
  .mo-bar-fill     { height:100%; border-radius:999px; transition:width 0.4s; }
  .mo-bar-count    { font-size:13px; font-weight:700; color:#0f172a; min-width:32px; }
  .mo-prog-badge   { font-size:12px; font-weight:700; padding:3px 10px; border-radius:999px; }
  .mo-prog-badge.ready { background:#dcfce7; color:#166534; }
  .mo-prog-badge.wait  { background:#fef3c7; color:#92400e; }

  /* ── Empty */
  .mo-empty {
    text-align:center; padding:80px 20px;
    background:#fff; border-radius:20px;
    box-shadow:0 2px 12px rgba(0,0,0,.06);
  }
  .mo-empty h3 { font-family:'Playfair Display',serif; font-size:24px; color:#1a3a1a; margin:14px 0 8px; }
  .mo-empty p  { color:#888; margin-bottom:20px; }
  .mo-empty-btn {
    display:inline-block; background:#16a34a; color:#fff;
    padding:12px 28px; border-radius:14px; text-decoration:none; font-weight:700;
  }

  /* ── Order card */
  .mo-card {
    background: #fff;
    border-radius: 20px;
    padding: clamp(18px,3vw,26px);
    margin-bottom: 18px;
    box-shadow: 0 4px 18px rgba(0,0,0,.06);
    border: 1px solid #e2e8f0;
    border-left: 4px solid #f59e0b;
    animation: fadeUp 0.3s ease both;
  }
  .mo-card.delivered { border-left-color: #22c55e; }

  .mo-card-header {
    display:flex; justify-content:space-between;
    align-items:center; flex-wrap:wrap; gap:10px;
  }
  .mo-card-date { font-size:13px; font-weight:700; color:#374151; margin-right:8px; }
  .mo-card-ago  {
    font-size:11px; color:#64748b; font-weight:600;
    background:#f1f5f9; padding:2px 8px; border-radius:999px;
  }
  .mo-status-pill { padding:6px 14px; border-radius:999px; font-size:13px; font-weight:700; }
  .mo-status-pill.green  { background:#dcfce7; color:#166534; }
  .mo-status-pill.yellow { background:#fef3c7; color:#92400e; }

  .mo-divider { height:1px; background:#f1f5f9; margin:16px 0; }

  /* Items */
  .mo-items { display:flex; flex-direction:column; gap:12px; margin-bottom:18px; }
  .mo-item  { display:flex; align-items:center; gap:14px; }
  .mo-item-img {
    width:64px; height:64px; border-radius:12px; object-fit:cover;
    flex-shrink:0; border:1px solid #f0f0ea;
  }
  .mo-item-img-placeholder {
    width:64px; height:64px; border-radius:12px; flex-shrink:0;
    background:#f0fdf4; display:flex; align-items:center; justify-content:center;
    font-size:28px; border:1px solid #c6e8c6;
  }
  .mo-item-info  { flex:1; min-width:0; }
  .mo-item-name  { font-size:15px; font-weight:700; color:#1a1a1a; margin-bottom:4px; }
  .mo-item-qty   { font-size:12px; color:#64748b; }
  .mo-item-price { font-size:16px; font-weight:800; color:#16a34a; white-space:nowrap; }

  /* Amounts */
  .mo-amounts { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
  .mo-amt-box {
    flex:1; min-width:90px; background:#f8fafc;
    border-radius:14px; padding:12px 14px; text-align:center; border:1px solid #e2e8f0;
  }
  .mo-amt-box.green  { background:#f0fdf4; border-color:#c6e8c6; }
  .mo-amt-box.orange { background:#fffbeb; border-color:#fde68a; }
  .mo-amt-val { font-size:17px; font-weight:800; color:#1a1a1a; }
  .mo-amt-box.green  .mo-amt-val { color:#16a34a; }
  .mo-amt-box.orange .mo-amt-val { color:#d97706; }
  .mo-amt-lbl {
    font-size:11px; color:#94a3b8; font-weight:600;
    margin-top:3px; text-transform:uppercase; letter-spacing:0.5px;
  }

  /* Thok */
  .mo-thok-box   { background:#fff7ed; border:1px solid #fed7aa; border-radius:12px; padding:12px 16px; margin-bottom:16px; }
  .mo-thok-title { font-weight:700; font-size:13px; color:#c2410c; margin-bottom:8px; }
  .mo-thok-row   { display:flex; align-items:center; gap:12px; margin-bottom:4px; }
  .mo-thok-name  { font-size:14px; font-weight:600; color:#374151; }
  .mo-thok-phone {
    font-size:14px; font-weight:700; color:#c2410c; text-decoration:none;
    background:#ffedd5; padding:4px 12px; border-radius:100px; border:1px solid #fed7aa;
  }

  /* Actions */
  .mo-again-btn {
    width:100%; padding:14px;
    background:linear-gradient(135deg,#2563eb,#1d4ed8);
    color:#fff; border:none; border-radius:14px;
    font-family:'Nunito',sans-serif; font-size:15px; font-weight:700;
    cursor:pointer; box-shadow:0 4px 14px rgba(37,99,235,.25);
    transition:transform 0.15s, box-shadow 0.2s;
  }
  .mo-again-btn:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(37,99,235,.35); }
  .mo-pending-txt { font-size:13px; font-weight:600; color:#b45309; margin-top:4px; }
`;
