import { useEffect, useState } from "react";
import { auth } from "../firebase";
import axios from "axios";

const API = import.meta.env.VITE_API;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Nunito:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes barGrow { from { width:0; } to { width:var(--w); } }
  @keyframes popIn   { from { opacity:0; transform:scale(.93); } to { opacity:1; transform:scale(1); } }

  .sd-root { min-height:100vh; background:#f0f4f0; font-family:'Nunito',sans-serif; }

  /* Support button */
  .sd-support-btn {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 999;
    display: flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #166534, #15803d);
    color: #fff;
    border: none;
    border-radius: 50px;
    padding: 13px 20px;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(22,101,52,.45);
    text-decoration: none;
    transition: transform .2s, box-shadow .2s;
    animation: popIn .4s ease;
  }
  .sd-support-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(22,101,52,.55);
  }
  .sd-support-icon { font-size: 20px; }

  /* ── LOADING / ERROR ── */
  .sd-center {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    min-height:100vh; gap:16px; text-align:center; padding:20px;
    background:linear-gradient(145deg,#0a1f0d,#133a1c);
  }
  .sd-center-title { font-family:'Playfair Display',serif; font-size:22px; color:#fff; margin-bottom:4px; }
  .sd-center-sub   { font-size:14px; color:rgba(255,255,255,.55); }
  .sd-big-spinner  {
    width:44px; height:44px; border:4px solid rgba(255,255,255,.15);
    border-top-color:#4ade80; border-radius:50%; animation:spin .75s linear infinite;
  }

  /* ── HERO ── */
  .sd-hero {
    padding:36px 24px 52px; position:relative; overflow:hidden;
    background:linear-gradient(145deg,#071a09 0%,#0f2d14 45%,#0a2210 75%,#071a09 100%);
  }
  .sd-hero.thok {
    background:linear-gradient(145deg,#1c0a03 0%,#7c2d12 45%,#92400e 75%,#1c0a03 100%);
  }
  .sd-hero::before {
    content:''; position:absolute; inset:0; pointer-events:none;
    background:radial-gradient(ellipse at 80% 35%, rgba(74,222,128,.13) 0%, transparent 55%),
               radial-gradient(ellipse at 10% 70%, rgba(52,211,153,.08) 0%, transparent 50%);
  }
  .sd-hero.thok::before {
    background:radial-gradient(ellipse at 80% 35%, rgba(251,146,60,.15) 0%, transparent 55%),
               radial-gradient(ellipse at 10% 70%, rgba(249,115,22,.08) 0%, transparent 50%);
  }
  .sd-hero-inner {
    max-width:1100px; margin:0 auto; position:relative; z-index:1;
    display:flex; justify-content:space-between; align-items:flex-end;
    flex-wrap:wrap; gap:28px;
  }

  .sd-hero-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.18);
    color:rgba(255,255,255,.8); font-size:11px; font-weight:700; letter-spacing:.08em;
    padding:5px 14px; border-radius:100px; margin-bottom:14px;
    text-transform:uppercase;
  }
  .sd-hero-title {
    font-family:'Playfair Display',serif;
    font-size:clamp(28px,4vw,42px); font-weight:900; color:#fff;
    line-height:1.1; margin-bottom:14px;
  }
  .sd-location-pill {
    display:inline-flex; align-items:center; gap:7px;
    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2);
    color:rgba(255,255,255,.85); font-size:13px; font-weight:700;
    padding:8px 18px; border-radius:100px;
  }

  /* Hero stats */
  .sd-hero-stats { display:flex; gap:14px; flex-wrap:wrap; }
  .sd-hstat {
    background:rgba(255,255,255,.09); border:1px solid rgba(255,255,255,.13);
    border-radius:18px; padding:18px 24px; min-width:110px; text-align:center;
    backdrop-filter:blur(8px);
  }
  .sd-hstat-val {
    font-family:'Playfair Display',serif;
    font-size:30px; font-weight:800; color:#fff; line-height:1;
  }
  .sd-hstat-lbl { font-size:11px; color:rgba(255,255,255,.5); font-weight:700; margin-top:5px; letter-spacing:.06em; text-transform:uppercase; }

  /* ── BODY ── */
  .sd-body { max-width:1100px; margin:0 auto; padding:28px 20px 48px; }

  /* ── PROGRESS BOX ── */
  .sd-progress-box {
    background:#fff; border-radius:20px; padding:22px 24px;
    box-shadow:0 4px 18px rgba(0,0,0,.07);
    border:1px solid rgba(0,0,0,.05);
    margin-bottom:24px; animation:fadeUp .4s ease;
  }
  .sd-progress-title {
    font-family:'Playfair Display',serif; font-size:17px; font-weight:800;
    color:#0f172a; margin-bottom:18px; display:flex; align-items:center; gap:8px;
  }

  .sd-prog-row { display:flex; align-items:center; gap:12px; margin-bottom:14px; flex-wrap:wrap; }
  .sd-prog-label { font-size:13px; font-weight:700; color:#374151; min-width:140px; }
  .sd-bar-track { flex:1; min-width:80px; height:10px; background:#f0f4f0; border-radius:100px; overflow:hidden; }
  .sd-bar-fill  { height:100%; border-radius:100px; transition:width .5s cubic-bezier(.4,0,.2,1); }
  .sd-prog-num  { font-size:13px; font-weight:800; color:#0f172a; min-width:20px; text-align:right; }
  .sd-prog-chip {
    font-size:12px; font-weight:700; padding:3px 11px; border-radius:100px; white-space:nowrap;
  }
  .sd-prog-warn {
    font-size:13px; font-weight:700; color:#dc2626;
    background:#fef2f2; border:1px solid #fecaca;
    border-radius:12px; padding:10px 14px; margin-top:4px;
    display:flex; align-items:center; gap:6px;
  }

  /* Day list */
  .sd-daylist { border-top:1.5px dashed #e5e7eb; padding-top:16px; margin-top:16px; }
  .sd-daylist-hdr { font-size:12px; font-weight:800; color:#6b7280; letter-spacing:.06em; text-transform:uppercase; margin-bottom:10px; }
  .sd-daylist-row {
    display:flex; align-items:center; gap:10px; padding:6px 0;
    border-bottom:1px solid #f5f5f5; flex-wrap:wrap;
  }
  .sd-daylist-row:last-child { border-bottom:none; }
  .sd-dl-num   { font-size:11px; font-weight:800; background:#ede9fe; color:#7c3aed; padding:2px 9px; border-radius:100px; flex-shrink:0; }
  .sd-dl-name  { flex:1; font-size:13px; font-weight:700; color:#374151; }
  .sd-dl-date  { font-size:11px; font-weight:700; background:#f1f5f9; color:#64748b; padding:2px 9px; border-radius:100px; }

  /* ── TABS ── */
  .sd-tabs {
    display:flex; align-items:center; gap:10px;
    margin-bottom:26px; flex-wrap:wrap;
    background:#fff; border-radius:18px; padding:10px 14px;
    box-shadow:0 2px 10px rgba(0,0,0,.06);
  }
  .sd-tab {
    display:flex; align-items:center; gap:8px;
    padding:10px 20px; border-radius:12px; border:none;
    font-family:'Nunito',sans-serif; font-size:14px; font-weight:700;
    color:#6b7280; background:transparent; cursor:pointer; transition:all .2s;
  }
  .sd-tab:hover { background:#f0f4f0; color:#374151; }
  .sd-tab.active      { background:linear-gradient(135deg,#16a34a,#22c55e); color:#fff; box-shadow:0 4px 12px rgba(22,163,74,.3); }
  .sd-tab.active-thok { background:linear-gradient(135deg,#c2410c,#f97316); color:#fff; box-shadow:0 4px 12px rgba(249,115,22,.3); }
  .sd-tab-count {
    font-size:12px; font-weight:800; padding:2px 8px; border-radius:100px;
    background:rgba(255,255,255,.25);
  }
  .sd-tab:not(.active):not(.active-thok) .sd-tab-count { background:#f0f0ea; color:#9ca3af; }

  .sd-add-btn {
    margin-left:auto; display:inline-flex; align-items:center; gap:6px;
    background:linear-gradient(135deg,#16a34a,#22c55e); color:#fff;
    padding:11px 20px; border-radius:12px; text-decoration:none;
    font-weight:800; font-size:14px;
    box-shadow:0 4px 14px rgba(22,163,74,.3);
    transition:transform .15s, box-shadow .2s;
  }
  .sd-add-btn:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(22,163,74,.4); }
  .sd-add-btn.thok { background:linear-gradient(135deg,#c2410c,#f97316); box-shadow:0 4px 14px rgba(249,115,22,.3); }
  .sd-add-btn.thok:hover { box-shadow:0 8px 20px rgba(249,115,22,.4); }

  /* MSG */
  .sd-msg { padding:13px 18px; border-radius:14px; font-size:14px; font-weight:700; margin-bottom:18px; animation:fadeUp .3s ease; }
  .sd-msg.success { background:#f0fdf4; border:1px solid #bbf7d0; color:#16a34a; }
  .sd-msg.error   { background:#fef2f2; border:1px solid #fecaca; color:#dc2626; }

  /* ── EMPTY ── */
  .sd-empty { text-align:center; padding:72px 20px; background:#fff; border-radius:22px; box-shadow:0 2px 12px rgba(0,0,0,.06); animation:fadeUp .4s ease; }
  .sd-empty-icon  { font-size:60px; margin-bottom:18px; display:block; }
  .sd-empty-title { font-family:'Playfair Display',serif; font-size:22px; color:#1a2e1a; margin-bottom:8px; font-weight:800; }
  .sd-empty-sub   { color:#6b7280; font-size:14px; }

  /* ── PRODUCTS GRID ── */
  .sd-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:18px; }
  @media(max-width:480px) { .sd-grid { grid-template-columns:repeat(2,1fr); gap:12px; } }

  .sd-card {
    background:#fff; border-radius:20px; overflow:hidden;
    box-shadow:0 2px 12px rgba(0,0,0,.07); border:1px solid rgba(0,0,0,.05);
    transition:transform .2s, box-shadow .2s; animation:fadeUp .35s ease both;
  }
  .sd-card:hover { transform:translateY(-4px); box-shadow:0 10px 28px rgba(0,0,0,.12); }

  .sd-card-img-wrap { position:relative; overflow:hidden; }
  .sd-card-img { width:100%; height:155px; object-fit:cover; display:block; transition:transform .4s ease; }
  .sd-card:hover .sd-card-img { transform:scale(1.06); }
  .sd-card-loc-tag {
    position:absolute; bottom:8px; left:8px;
    background:rgba(0,0,0,.55); color:#fff; font-size:11px; font-weight:700;
    padding:3px 9px; border-radius:8px; backdrop-filter:blur(4px);
  }

  .sd-card-body { padding:14px 16px 18px; }
  .sd-card-name {
    font-weight:800; font-size:16px; color:#0f172a; margin-bottom:5px;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .sd-card-price {
    font-family:'Playfair Display',serif; font-size:20px; font-weight:800; color:#16a34a;
    margin-bottom:14px; display:flex; align-items:baseline; gap:4px;
  }
  .sd-card-price span { font-family:'Nunito',sans-serif; font-size:12px; color:#9ca3af; font-weight:600; }
  .sd-card-btns { display:flex; gap:8px; }

  /* Edit mode */
  .sd-edit-label { display:block; font-size:11px; font-weight:800; color:#9ca3af; letter-spacing:.05em; text-transform:uppercase; margin:10px 0 5px; }
  .sd-edit-input {
    width:100%; padding:10px 13px; border:1.5px solid #d1d5db; border-radius:10px;
    font-family:'Nunito',sans-serif; font-size:14px; font-weight:700; outline:none;
    transition:border .2s, box-shadow .2s; background:#fafafa;
  }
  .sd-edit-input:focus { border-color:#16a34a; box-shadow:0 0 0 3px rgba(22,163,74,.1); background:#fff; }

  /* Buttons */
  .sd-save-btn {
    flex:1; padding:10px; border:none; border-radius:10px;
    background:linear-gradient(135deg,#16a34a,#22c55e); color:#fff;
    font-family:'Nunito',sans-serif; font-weight:800; font-size:13px; cursor:pointer;
    transition:opacity .15s;
  }
  .sd-save-btn:disabled { opacity:.55; cursor:not-allowed; }
  .sd-cancel-btn {
    flex:1; padding:10px; border:1px solid #e5e7eb; border-radius:10px;
    background:#f9fafb; color:#6b7280;
    font-family:'Nunito',sans-serif; font-size:13px; cursor:pointer;
  }
  .sd-edit-btn {
    flex:1; padding:10px; border:none; border-radius:10px;
    background:#eff6ff; color:#1d4ed8;
    font-family:'Nunito',sans-serif; font-weight:700; font-size:12px; cursor:pointer;
    transition:background .15s, transform .15s;
  }
  .sd-edit-btn:hover { background:#dbeafe; transform:translateY(-1px); }
  .sd-delete-btn {
    flex:1; padding:10px; border:none; border-radius:10px;
    background:#fef2f2; color:#dc2626;
    font-family:'Nunito',sans-serif; font-weight:700; font-size:12px; cursor:pointer;
    transition:background .15s, transform .15s;
  }
  .sd-delete-btn:hover { background:#fee2e2; transform:translateY(-1px); }

  /* ── ORDER CARDS ── */
  .sd-orders { display:flex; flex-direction:column; gap:18px; }
  .sd-order-card {
    background:#fff; border-radius:20px; overflow:hidden;
    box-shadow:0 3px 14px rgba(0,0,0,.07); border:1px solid rgba(0,0,0,.04);
    border-left:5px solid #f59e0b;
    animation:fadeUp .4s ease both;
    transition:box-shadow .2s, transform .2s;
  }
  .sd-order-card:hover { box-shadow:0 8px 26px rgba(0,0,0,.11); transform:translateY(-2px); }
  .sd-order-card.delivered { border-left-color:#22c55e; }

  /* Order header */
  .sd-order-head {
    padding:18px 22px 16px; border-bottom:1.5px solid #f5f5f0;
    display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:14px;
    background:linear-gradient(135deg,#fffdf5,#fffbeb);
  }
  .sd-order-card.delivered .sd-order-head { background:linear-gradient(135deg,#f0fdf4,#dcfce7); }

  .sd-order-num  { font-size:11px; font-weight:800; color:#9ca3af; letter-spacing:.05em; text-transform:uppercase; margin-bottom:4px; }
  .sd-order-name { font-family:'Playfair Display',serif; font-size:18px; font-weight:800; color:#0f172a; margin-bottom:6px; }
  .sd-order-meta { display:flex; flex-wrap:wrap; gap:8px; }
  .sd-order-mpill {
    display:inline-flex; align-items:center; gap:5px;
    font-size:12px; font-weight:700; padding:4px 11px; border-radius:100px;
  }

  .sd-pending-badge   { background:#fef3c7; color:#92400e; border:1px solid #fde68a; }
  .sd-delivered-badge { background:#dcfce7; color:#166534; border:1px solid #86efac; }
  .sd-days-badge      { background:#f1f5f9; color:#64748b; border:1px solid #e2e8f0; }

  /* Order body — 3 col */
  .sd-order-body { padding:18px 22px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:18px; }
  @media(max-width:640px) { .sd-order-body { grid-template-columns:1fr; } }

  .sd-col-label { font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:#9ca3af; margin-bottom:10px; }

  .sd-buyer-phone { font-size:13px; font-weight:700; color:#0f172a; margin-bottom:5px; display:flex; align-items:center; gap:5px; }
  .sd-buyer-addr  { font-size:12px; color:#6b7280; line-height:1.55; display:flex; gap:5px; }

  .sd-item-row { display:flex; justify-content:space-between; font-size:13px; color:#374151; font-weight:600; padding:5px 0; border-bottom:1px solid #f5f5f0; }
  .sd-item-row:last-child { border-bottom:none; }
  .sd-item-qty { color:#9ca3af; font-weight:700; }

  .sd-amounts { display:flex; flex-direction:column; gap:8px; }
  .sd-amount-box { display:flex; justify-content:space-between; align-items:center; padding:9px 12px; border-radius:10px; }
  .sd-abox-lbl { font-size:11px; font-weight:700; color:#6b7280; }
  .sd-abox-val { font-size:15px; font-weight:800; }

  /* Order footer */
  .sd-order-foot { padding:14px 22px; border-top:1.5px solid #f5f5f0; }
  .sd-deliver-btn {
    width:100%; padding:14px; border:none; border-radius:14px;
    background:linear-gradient(135deg,#16a34a,#22c55e); color:#fff;
    font-family:'Nunito',sans-serif; font-size:15px; font-weight:800; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px;
    box-shadow:0 4px 14px rgba(22,163,74,.3);
    transition:transform .15s, box-shadow .2s;
  }
  .sd-deliver-btn:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(22,163,74,.4); }
`;

export default function SellerDashboard() {
  const [products, setProducts]               = useState([]);
  const [orders, setOrders]                   = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [sellerLocation, setSellerLocation]   = useState("");
  const [sellerType, setSellerType]           = useState(null);
  const [sellerId, setSellerId]               = useState("");
  const [tab, setTab]                         = useState("products");
  const [loading, setLoading]                 = useState(true);
  const [editMap, setEditMap]                 = useState({});
  const [savingId, setSavingId]               = useState(null);
  const [editMsg, setEditMsg]                 = useState("");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) return;
      setSellerId(u.uid);
      try {
        const res  = await axios.get(`${API}/api/users/check/${u.uid}`);
        const loc  = res.data.location   || "";
        const type = res.data.sellerType || "city_seller";
        setSellerLocation(loc);
        setSellerType(type);
        if (loc) {
          loadProducts(u.uid);
          if (type === "thok_seller") {
            loadThokOrders(u.uid);
            loadThokOrders(u.uid, "delivered");
          } else {
            loadCityOrders(u.uid);
            loadCityOrders(u.uid, "delivered");
          }
        }
      } catch (err) { console.log(err); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, []);

  async function loadProducts(uid) {
    try { const res = await axios.get(`${API}/api/products/seller/${uid}`); setProducts(res.data); }
    catch (err) { console.log(err); }
  }

  async function loadCityOrders(uid, status = "pending") {
    try {
      const res = await axios.get(`${API}/api/orders/city-seller/${uid}?status=${status}`);
      if (status === "delivered") setDeliveredOrders(res.data); else setOrders(res.data);
    } catch (err) { console.log(err); }
  }

  async function loadThokOrders(uid, status = "pending") {
    try {
      const res = await axios.get(`${API}/api/orders/thok-seller/${uid}?status=${status}`);
      if (status === "delivered") setDeliveredOrders(res.data); else setOrders(res.data);
    } catch (err) { console.log(err); }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Yeh product delete karna chahte ho?")) return;
    try { await axios.delete(`${API}/api/products/${id}`); setProducts(prev => prev.filter(p => p._id !== id)); }
    catch { alert("Delete nahi hua"); }
  }

  function startEdit(p)  { setEditMsg(""); setEditMap(prev => ({ ...prev, [p._id]: { name: p.name, price: p.price } })); }
  function cancelEdit(id){ setEditMap(prev => { const n = { ...prev }; delete n[id]; return n; }); }

  async function saveEdit(id) {
    const { name, price } = editMap[id] || {};
    if (!name?.trim())                               { setEditMsg("Naam khali nahi ho sakta"); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) { setEditMsg("Sahi price daalo"); return; }
    try {
      setSavingId(id);
      setEditMsg("");
      const res = await axios.put(`${API}/api/products/${id}`, { name: name.trim(), price: Number(price) });
      setProducts(prev => prev.map(p => p._id === id ? { ...p, ...res.data.product } : p));
      cancelEdit(id);
      setEditMsg("✅ Product update ho gaya!");
      setTimeout(() => setEditMsg(""), 3000);
    } catch { setEditMsg("❌ Save nahi hua"); }
    finally { setSavingId(null); }
  }

  async function markDelivered(id) {
    try {
      await axios.put(`${API}/api/orders/deliver/${id}`);
      setOrders(prev => prev.filter(o => o._id !== id));
    } catch (err) { console.log(err); }
  }

  function daysAgo(dateStr) {
    const d = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
    if (d === 0) return "Aaj";
    if (d === 1) return "1 din pehle";
    return `${d} din pehle`;
  }

  const isThok = sellerType === "thok_seller";
  const acCls  = isThok ? "active-thok" : "active";

  /* ── LOADING ── */
  if (loading) return (
    <>
      <style>{css}</style>
      <div className="sd-center">
        <div className="sd-big-spinner" />
        <p className="sd-center-title">Dashboard Load Ho Raha Hai</p>
        <p className="sd-center-sub">Thoda rukiye...</p>
      </div>
    </>
  );

  /* ── NO LOCATION ── */
  if (!sellerLocation) return (
    <>
      <style>{css}</style>
      <div className="sd-center">
        <span style={{ fontSize: 52, marginBottom: 12 }}>⚠️</span>
        <p className="sd-center-title">Location Set Nahi Hai</p>
        <p className="sd-center-sub">Admin se contact karo — woh tumhe city assign karega</p>
      </div>
    </>
  );

  /* Progress tracker data */
  const todayCount     = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;
  const oldestOrder    = orders.length ? [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0] : null;
  const daysSinceOldest= oldestOrder ? Math.floor((Date.now() - new Date(oldestOrder.createdAt)) / 86400000) : 0;
  const pendingPct     = Math.min((orders.length / 10) * 100, 100);
  const todayPct       = orders.length ? Math.min((todayCount / orders.length) * 100, 100) : 0;
  const themeColor     = isThok ? "#f97316" : "#22c55e";

  return (
    <>
      <style>{css}</style>
      <div className="sd-root">

        {/* Support button */}
        <a
          href="tel:7017696580"
          style={{
            position:"fixed", bottom:24, right:24, zIndex:9999,
            display:"flex", alignItems:"center", gap:10,
            background:"linear-gradient(135deg,#166534,#15803d)",
            color:"#fff", borderRadius:50, padding:"13px 20px",
            fontFamily:"Nunito,sans-serif", fontSize:14, fontWeight:700,
            textDecoration:"none", boxShadow:"0 4px 20px rgba(22,101,52,.5)",
            cursor:"pointer"
          }}
        >
          <span style={{fontSize:20}}>🎧</span>
          <span>Help</span>
        </a>

        {/* ── HERO ── */}
        <div className={`sd-hero${isThok ? " thok" : ""}`}>
          <div className="sd-hero-inner">
            <div>
              <div className="sd-hero-badge">{isThok ? "🏭 Thok Mandi Seller" : "🧑‍🌾 City Seller"}</div>
              <h1 className="sd-hero-title">Mera Dashboard</h1>
              <div className="sd-location-pill">
                {isThok ? "🏭" : "📍"} {sellerLocation} {isThok ? "Mandi" : "Market"}
              </div>
            </div>
            <div className="sd-hero-stats">
              {[
                { val: products.length,       lbl: "Products",   col: themeColor },
                { val: orders.length,          lbl: "Pending",    col: "#fbbf24"  },
                { val: deliveredOrders.length, lbl: "Delivered",  col: "#34d399"  },
              ].map(s => (
                <div className="sd-hstat" key={s.lbl}>
                  <div className="sd-hstat-val" style={{ color: s.col }}>{s.val}</div>
                  <div className="sd-hstat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sd-body">

          {/* ── PROGRESS TRACKER ── */}
          {orders.length > 0 && (
            <div className="sd-progress-box">
              <div className="sd-progress-title">📊 Order Progress</div>

              <div className="sd-prog-row">
                <span className="sd-prog-label">🧾 Pending Orders</span>
                <div className="sd-bar-track">
                  <div className="sd-bar-fill" style={{ width: `${pendingPct}%`, background: themeColor }} />
                </div>
                <span className="sd-prog-num">{orders.length}</span>
                <span className="sd-prog-chip" style={{ background: "#fef3c7", color: "#92400e" }}>
                  {orders.length} pending
                </span>
              </div>

              <div className="sd-prog-row">
                <span className="sd-prog-label">📅 Aaj Ke Orders</span>
                <div className="sd-bar-track">
                  <div className="sd-bar-fill" style={{ width: `${todayPct}%`, background: "#3b82f6" }} />
                </div>
                <span className="sd-prog-num">{todayCount}</span>
                <span className="sd-prog-chip" style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                  {todayCount > 0 ? `${todayCount} aaj` : "Aaj koi nahi"}
                </span>
              </div>

              {daysSinceOldest > 0 && (
                <div className="sd-prog-warn">
                  ⚠️ Sabse purana order {daysSinceOldest} din se pending hai — jaldi deliver karo!
                </div>
              )}

              <div className="sd-daylist">
                <div className="sd-daylist-hdr">Orders — Din ke Hisab Se</div>
                {[...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((o, i) => (
                  <div key={o._id} className="sd-daylist-row">
                    <span className="sd-dl-num">#{i + 1}</span>
                    <span className="sd-dl-name">{o.name}</span>
                    <span className="sd-dl-date">{daysAgo(o.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TABS ── */}
          <div className="sd-tabs">
            <button className={`sd-tab ${tab === "products"  ? acCls : ""}`} onClick={() => setTab("products")}>
              📦 Products <span className="sd-tab-count">{products.length}</span>
            </button>
            <button className={`sd-tab ${tab === "orders"    ? acCls : ""}`} onClick={() => setTab("orders")}>
              🧾 Pending  <span className="sd-tab-count">{orders.length}</span>
            </button>
            <button className={`sd-tab ${tab === "delivered" ? acCls : ""}`} onClick={() => setTab("delivered")}>
              ✅ Delivered <span className="sd-tab-count">{deliveredOrders.length}</span>
            </button>
            <a href="/seller-add-product" className={`sd-add-btn${isThok ? " thok" : ""}`}>
              ＋ Product Add Karo
            </a>
          </div>

          {/* ── PRODUCTS TAB ── */}
          {tab === "products" && (
            <div>
              {editMsg && <div className={`sd-msg ${editMsg.startsWith("✅") ? "success" : "error"}`}>{editMsg}</div>}
              {products.length === 0 ? (
                <div className="sd-empty">
                  <span className="sd-empty-icon">🌿</span>
                  <div className="sd-empty-title">Koi Product Nahi</div>
                  <div className="sd-empty-sub">"Product Add Karo" button dabaao</div>
                </div>
              ) : (
                <div className="sd-grid">
                  {products.map((p, idx) => {
                    const isEditing = !!editMap[p._id];
                    const ed = editMap[p._id] || {};
                    return (
                      <div key={p._id} className="sd-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <div className="sd-card-img-wrap">
                          <img src={p.image} alt={p.name} className="sd-card-img" loading="lazy" />
                          {p.location && <div className="sd-card-loc-tag">📍 {p.location}</div>}
                        </div>
                        <div className="sd-card-body">
                          {isEditing ? (
                            <>
                              <label className="sd-edit-label">Product Naam</label>
                              <input className="sd-edit-input" value={ed.name}
                                onChange={e => setEditMap(prev => ({ ...prev, [p._id]: { ...prev[p._id], name: e.target.value } }))} />
                              <label className="sd-edit-label">Price (₹)</label>
                              <input className="sd-edit-input" type="number" value={ed.price}
                                onChange={e => setEditMap(prev => ({ ...prev, [p._id]: { ...prev[p._id], price: e.target.value } }))} />
                              <div className="sd-card-btns" style={{ marginTop: 14 }}>
                                <button className="sd-save-btn" onClick={() => saveEdit(p._id)} disabled={savingId === p._id}>
                                  {savingId === p._id ? "⏳" : "✅ Save"}
                                </button>
                                <button className="sd-cancel-btn" onClick={() => cancelEdit(p._id)} disabled={savingId === p._id}>Cancel</button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="sd-card-name">{p.name}</div>
                              <div className="sd-card-price">₹{p.price}<span>/kg</span></div>
                              <div className="sd-card-btns">
                                <button className="sd-edit-btn"   onClick={() => startEdit(p)}>✏️ Edit</button>
                                <button className="sd-delete-btn" onClick={() => deleteProduct(p._id)}>🗑️ Delete</button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {tab === "orders" && (
            orders.length === 0 ? (
              <div className="sd-empty">
                <span className="sd-empty-icon">📭</span>
                <div className="sd-empty-title">Koi Pending Order Nahi</div>
                <div className="sd-empty-sub">Jab customer order karega tab yahan dikhega</div>
              </div>
            ) : (
              <div className="sd-orders">
                {orders.map((o, idx) => (
                  <OrderCard key={o._id} o={o} idx={idx} isThok={isThok} daysAgo={daysAgo}
                    footer={
                      <div className="sd-order-foot">
                        <button className="sd-deliver-btn" onClick={() => markDelivered(o._id)}>
                          ✅ Mark as Delivered
                        </button>
                      </div>
                    }
                  />
                ))}
              </div>
            )
          )}

          {/* ── DELIVERED TAB ── */}
          {tab === "delivered" && (
            deliveredOrders.length === 0 ? (
              <div className="sd-empty">
                <span className="sd-empty-icon">📦</span>
                <div className="sd-empty-title">Koi Delivered Order Nahi</div>
                <div className="sd-empty-sub">Jab orders deliver honge tab yahan dikhenge</div>
              </div>
            ) : (
              <div className="sd-orders">
                {deliveredOrders.map((o, idx) => (
                  <OrderCard key={o._id} o={o} idx={idx} isThok={isThok} daysAgo={daysAgo} delivered />
                ))}
              </div>
            )
          )}

        </div>
      </div>
    </>
  );
}

function OrderCard({ o, idx, isThok, daysAgo, delivered = false, footer }) {
  const pending = o.totalPrice - (o.advancePaid || 0);
  return (
    <div
      className={`sd-order-card${delivered ? " delivered" : ""}`}
      style={{ animationDelay: `${idx * 0.06}s` }}
    >
      {/* Header */}
      <div className="sd-order-head">
        <div>
          <div className="sd-order-num">Order #{String(o._id).slice(-6).toUpperCase()}</div>
          <div className="sd-order-name">{o.name || "—"}</div>
          <div className="sd-order-meta">
            {delivered
              ? <span className="sd-order-mpill sd-delivered-badge">✅ Delivered</span>
              : <span className="sd-order-mpill sd-pending-badge">⏳ Pending</span>
            }
            <span className="sd-order-mpill sd-days-badge">{daysAgo(o.createdAt)}</span>
            {isThok
              ? <span className="sd-order-mpill" style={{ background:"#fff7ed", color:"#c2410c", border:"1px solid #fed7aa" }}>🏭 Thok</span>
              : <span className="sd-order-mpill" style={{ background:"#f0fdf4", color:"#15803d", border:"1px solid #bbf7d0" }}>🛒 City</span>
            }
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:"#0f172a" }}>₹{o.totalPrice}</div>
          <div style={{ fontSize:12, color:"#9ca3af", fontWeight:600, marginTop:2 }}>Total Amount</div>
        </div>
      </div>

      {/* Body — 3 cols */}
      <div className="sd-order-body">
        {/* Buyer */}
        <div>
          <div className="sd-col-label">👤 Buyer Info</div>
          <div className="sd-buyer-phone">📞 {o.phone || "—"}</div>
          <div className="sd-buyer-addr">🏠 <span>{o.address || "—"}</span></div>
        </div>

        {/* Items */}
        <div>
          <div className="sd-col-label">📦 Items ({o.totalQty} qty)</div>
          {(o.items || []).map((x, i) => (
            <div key={i} className="sd-item-row">
              <span>{x.name}</span>
              <span className="sd-item-qty">×{x.qty}</span>
            </div>
          ))}
        </div>

        {/* Amounts */}
        <div>
          <div className="sd-col-label">💰 Payment</div>
          <div className="sd-amounts">
            <div className="sd-amount-box" style={{ background:"#f0fdf4" }}>
              <span className="sd-abox-lbl">Total</span>
              <span className="sd-abox-val" style={{ color:"#15803d" }}>₹{o.totalPrice}</span>
            </div>
            <div className="sd-amount-box" style={{ background:"#eff6ff" }}>
              <span className="sd-abox-lbl">Advance Paid</span>
              <span className="sd-abox-val" style={{ color:"#1d4ed8" }}>₹{o.advancePaid || 0}</span>
            </div>
            <div className="sd-amount-box" style={{ background:"#fff7ed" }}>
              <span className="sd-abox-lbl">{delivered ? "Baaki Mila" : "Baaki Milna"}</span>
              <span className="sd-abox-val" style={{ color:"#c2410c" }}>₹{pending}</span>
            </div>
          </div>
        </div>
      </div>

      {footer}
    </div>
  );
}
