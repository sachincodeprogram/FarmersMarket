import { useEffect, useState } from "react";
import { auth } from "../firebase";
import axios from "axios";

const API = import.meta.env.VITE_API;

export default function SellerDashboard() {
  const [products, setProducts]             = useState([]);
  const [orders, setOrders]                 = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [sellerLocation, setSellerLocation] = useState("");
  const [sellerType, setSellerType]         = useState(null); // "city_seller" | "thok_seller"
  const [sellerId, setSellerId]             = useState("");
  const [tab, setTab]                       = useState("products");
  const [loading, setLoading]               = useState(true);
  const [editMap, setEditMap]               = useState({});
  const [savingId, setSavingId]             = useState(null);
  const [editMsg, setEditMsg]               = useState("");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) return;
      setSellerId(u.uid);
      try {
        const res = await axios.get(`${API}/api/users/check/${u.uid}`);
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
    try {
      const res = await axios.get(`${API}/api/products/seller/${uid}`);
      setProducts(res.data);
    } catch (err) { console.log(err); }
  }

  async function loadCityOrders(uid, status = "pending") {
    try {
      const res = await axios.get(`${API}/api/orders/city-seller/${uid}?status=${status}`);
      if (status === "delivered") setDeliveredOrders(res.data);
      else setOrders(res.data);
    } catch (err) { console.log(err); }
  }

  async function loadThokOrders(uid, status = "pending") {
    try {
      const res = await axios.get(`${API}/api/orders/thok-seller/${uid}?status=${status}`);
      if (status === "delivered") setDeliveredOrders(res.data);
      else setOrders(res.data);
    } catch (err) { console.log(err); }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Yeh product delete karna chahte ho?")) return;
    try {
      await axios.delete(`${API}/api/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) { alert("Delete nahi hua"); }
  }

  function startEdit(product) {
    setEditMsg("");
    setEditMap(prev => ({ ...prev, [product._id]: { name: product.name, price: product.price } }));
  }

  function cancelEdit(id) {
    setEditMap(prev => { const n = { ...prev }; delete n[id]; return n; });
  }

  async function saveEdit(id) {
    const { name, price } = editMap[id] || {};
    if (!name?.trim()) { setEditMsg("Naam khali nahi hona chahiye"); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) { setEditMsg("Sahi price daalo"); return; }
    try {
      setSavingId(id);
      setEditMsg("");
      const res = await axios.put(`${API}/api/products/${id}`, { name: name.trim(), price: Number(price) });
      setProducts(prev => prev.map(p => p._id === id ? { ...p, ...res.data.product } : p));
      cancelEdit(id);
      setEditMsg("✅ Product update ho gaya!");
      setTimeout(() => setEditMsg(""), 3000);
    } catch (err) { setEditMsg("Save nahi hua"); }
    finally { setSavingId(null); }
  }

  function daysAgo(dateStr){
    const d = Math.floor((Date.now() - new Date(dateStr)) / (1000*60*60*24));
    if(d === 0) return "Aaj";
    if(d === 1) return "1 din pehle";
    return d + " din pehle";
  }

  async function markDelivered(id) {
    try {
      await axios.put(`${API}/api/orders/deliver/${id}`);
      setOrders(prev => prev.filter(o => o._id !== id));
    } catch (err) { console.log(err); }
  }

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <div className="sd-center">
          <div className="sd-big-spinner" />
          <p>Dashboard load ho raha hai...</p>
        </div>
      </>
    );
  }

  if (!sellerLocation) {
    return (
      <>
        <style>{css}</style>
        <div className="sd-center">
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h3>Location Set Nahi Hai</h3>
          <p>Admin se contact karo — woh tumhe city assign karega</p>
        </div>
      </>
    );
  }

  const isThok = sellerType === "thok_seller";

  return (
    <>
      <style>{css}</style>
      <div className="sd-root">

        {/* ── TOP HERO ── */}
        <div className={`sd-hero ${isThok ? "sd-hero-thok" : ""}`}>
          <div className="sd-hero-inner">
            <div className="sd-hero-left">
              <div className="sd-seller-badge">
                {isThok ? "🏭 Thok Mandi Seller" : "🧑‍🌾 City Seller"}
              </div>
              <h1 className="sd-hero-title">Mera Dashboard</h1>
              <div className={`sd-location-pill ${isThok ? "sd-location-pill-thok" : ""}`}>
                {isThok ? "🏭" : "📍"} {sellerLocation} {isThok ? "Mandi" : "Market"}
              </div>
            </div>
            <div className="sd-stats-row">
              <StatCard icon="📦" label="Products" value={products.length} color={isThok ? "#f97316" : "#22c55e"} />
              <StatCard icon="🧾" label="Orders"   value={orders.length}   color={isThok ? "#fb923c" : "#f59e0b"} />
            </div>
          </div>
        </div>

        <div className="sd-body">

          {/* ── PROGRESS TRACKER ── */}
          {orders.length > 0 && (()=>{
            const oldest      = [...orders].sort((a,b)=> new Date(a.createdAt)-new Date(b.createdAt))[0];
            const newest      = [...orders].sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt))[0];
            const daysSinceOldest = Math.floor((Date.now()-new Date(oldest.createdAt))/(1000*60*60*24));
            const todayCount  = orders.filter(o=>
              new Date(o.createdAt).toDateString()===new Date().toDateString()
            ).length;
            return (
              <div className="sd-progress-box">
                <p className="sd-progress-title">📊 Order Progress</p>

                {/* Pending orders bar */}
                <div className="sd-prog-row">
                  <span className="sd-prog-label">🧾 Pending Orders:</span>
                  <div className="sd-bar-wrap">
                    <div className="sd-bar-fill" style={{width:`${Math.min((orders.length/10)*100,100)}%`, background: isThok?"#f97316":"#22c55e"}}/>
                  </div>
                  <span className="sd-prog-count">{orders.length}</span>
                  <span className={`sd-prog-badge ${orders.length>0?"sd-badge-ok":""}`}>
                    {orders.length>0 ? `${orders.length} pending` : "Koi order nahi"}
                  </span>
                </div>

                {/* Aaj ke orders */}
                <div className="sd-prog-row">
                  <span className="sd-prog-label">📅 Aaj Ke Orders:</span>
                  <div className="sd-bar-wrap">
                    <div className="sd-bar-fill" style={{width:`${Math.min((todayCount/orders.length)*100,100)}%`, background:"#3b82f6"}}/>
                  </div>
                  <span className="sd-prog-count">{todayCount}</span>
                  <span className="sd-prog-badge" style={{background:"#eff6ff",color:"#2563eb"}}>
                    {todayCount > 0 ? `${todayCount} aaj` : "Aaj koi nahi"}
                  </span>
                </div>

                {/* Oldest pending */}
                {daysSinceOldest > 0 && (
                  <p className="sd-prog-warn">
                    ⚠️ Sabse purana order {daysSinceOldest} din se pending hai — jaldi deliver karo!
                  </p>
                )}

                {/* Per-order day list */}
                <div className="sd-daylist-wrap">
                  <p className="sd-daylist-title">📋 Orders (Din ke Hisab Se)</p>
                  {[...orders].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map((o,i)=>(
                    <div key={o._id} className="sd-daylist-row">
                      <span className="sd-daylist-num">Order {i+1}</span>
                      <span className="sd-daylist-name">{o.name}</span>
                      <span className="sd-daylist-date">{daysAgo(o.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ── TABS ── */}
          <div className="sd-tabs">
            <button
              className={`sd-tab ${tab === "products" ? (isThok ? "active-thok" : "active") : ""}`}
              onClick={() => setTab("products")}
            >
              📦 Products
              <span className="sd-tab-count">{products.length}</span>
            </button>
            <button
              className={`sd-tab ${tab === "orders" ? (isThok ? "active-thok" : "active") : ""}`}
              onClick={() => setTab("orders")}
            >
              🧾 Orders
              <span className="sd-tab-count">{orders.length}</span>
            </button>
            <button
              className={`sd-tab ${tab === "delivered" ? (isThok ? "active-thok" : "active") : ""}`}
              onClick={() => setTab("delivered")}
            >
              ✅ Delivered
              <span className="sd-tab-count">{deliveredOrders.length}</span>
            </button>
            <a href="/seller-add-product" className={`sd-add-btn ${isThok ? "sd-add-btn-thok" : ""}`}>
              ＋ Product Add Karo
            </a>
          </div>

          {/* ── PRODUCTS TAB ── */}
          {tab === "products" && (
            <div>
              {editMsg && (
                <div className={`sd-msg ${editMsg.startsWith("✅") ? "success" : "error"}`}>
                  {editMsg}
                </div>
              )}

              {products.length === 0 ? (
                <div className="sd-empty">
                  <div style={{ fontSize: 56 }}>🌿</div>
                  <h3>Koi Product Nahi</h3>
                  <p>Upar "Product Add Karo" button dabaao</p>
                </div>
              ) : (
                <div className="sd-grid">
                  {products.map(p => {
                    const isEditing = !!editMap[p._id];
                    const ed = editMap[p._id] || {};
                    return (
                      <div key={p._id} className="sd-card">
                        <div className="sd-card-img-wrap">
                          <img src={p.image} alt={p.name} className="sd-card-img" />
                          <div className="sd-card-location">📍 {p.location}</div>
                        </div>

                        <div className="sd-card-body">
                          {isEditing ? (
                            <>
                              <label className="sd-edit-label">Naam</label>
                              <input
                                className="sd-edit-input"
                                value={ed.name}
                                onChange={e => setEditMap(prev => ({
                                  ...prev, [p._id]: { ...prev[p._id], name: e.target.value }
                                }))}
                              />
                              <label className="sd-edit-label">Price (₹)</label>
                              <input
                                className="sd-edit-input"
                                type="number"
                                value={ed.price}
                                onChange={e => setEditMap(prev => ({
                                  ...prev, [p._id]: { ...prev[p._id], price: e.target.value }
                                }))}
                              />
                              <div className="sd-card-btns">
                                <button
                                  className="sd-save-btn"
                                  onClick={() => saveEdit(p._id)}
                                  disabled={savingId === p._id}
                                >
                                  {savingId === p._id ? "⏳" : "✅ Save"}
                                </button>
                                <button
                                  className="sd-cancel-btn"
                                  onClick={() => cancelEdit(p._id)}
                                  disabled={savingId === p._id}
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <h3 className="sd-card-name">{p.name}</h3>
                              <div className="sd-card-price">₹{p.price}<span>/kg</span></div>
                              <div className="sd-card-btns">
                                <button className="sd-edit-btn" onClick={() => startEdit(p)}>
                                  ✏️ Edit
                                </button>
                                <button className="sd-delete-btn" onClick={() => deleteProduct(p._id)}>
                                  🗑️ Delete
                                </button>
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
            <div>
              {orders.length === 0 ? (
                <div className="sd-empty">
                  <div style={{ fontSize: 56 }}>📭</div>
                  <h3>Koi Pending Order Nahi</h3>
                  <p>Jab customer order karega tab yahan dikhega</p>
                </div>
              ) : (
                <div className="sd-orders">
                  {orders.map(o => (
                    <div key={o._id} className="sd-order-card">
                      <div className="sd-order-header">
                        <div>
                          <div className="sd-order-name">{o.name}</div>
                          <div className="sd-order-contact">📞 {o.phone}</div>
                          <div className="sd-order-address">🏠 {o.address}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div className="sd-pending-badge">⏳ Pending</div>
                          <div className="sd-days-tag">{daysAgo(o.createdAt)}</div>
                        </div>
                      </div>

                      <div className="sd-order-divider" />

                      <div className="sd-order-items-label">Items:</div>
                      <div className="sd-order-items">
                        {o.items.map((x, i) => (
                          <div key={i} className="sd-order-item">
                            • {x.name} × {x.qty}
                          </div>
                        ))}
                      </div>

                      <div className="sd-order-amounts">
                        <div className="sd-amount-box">
                          <div className="sd-amount-val">₹{o.totalPrice}</div>
                          <div className="sd-amount-lbl">Total</div>
                        </div>
                        <div className="sd-amount-box green">
                          <div className="sd-amount-val">₹{o.advancePaid || 0}</div>
                          <div className="sd-amount-lbl">Advance Paid</div>
                        </div>
                        <div className="sd-amount-box orange">
                          <div className="sd-amount-val">₹{o.totalPrice - (o.advancePaid || 0)}</div>
                          <div className="sd-amount-lbl">Baaki</div>
                        </div>
                      </div>

                      <button
                        className="sd-deliver-btn"
                        onClick={() => markDelivered(o._id)}
                      >
                        ✅ Mark as Delivered
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── DELIVERED TAB ── */}
          {tab === "delivered" && (
            <div>
              {deliveredOrders.length === 0 ? (
                <div className="sd-empty">
                  <div style={{ fontSize: 56 }}>📦</div>
                  <h3>Koi Delivered Order Nahi</h3>
                  <p>Jab orders deliver honge tab yahan dikhenge</p>
                </div>
              ) : (
                <div className="sd-orders">
                  {deliveredOrders.map((o, i) => (
                    <div key={o._id} className="sd-order-card sd-order-delivered">
                      <div className="sd-order-header">
                        <div>
                          <div className="sd-order-name">{o.name}</div>
                          <div className="sd-order-contact">📞 {o.phone}</div>
                          <div className="sd-order-address">🏠 {o.address}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div className="sd-delivered-badge">✅ Delivered</div>
                          <div className="sd-days-tag">{daysAgo(o.createdAt)}</div>
                        </div>
                      </div>

                      <div className="sd-order-divider" />

                      <div className="sd-order-items-label">Items:</div>
                      <div className="sd-order-items">
                        {o.items.map((x, j) => (
                          <div key={j} className="sd-order-item">
                            • {x.name} × {x.qty}
                          </div>
                        ))}
                      </div>

                      <div className="sd-order-amounts">
                        <div className="sd-amount-box">
                          <div className="sd-amount-val">₹{o.totalPrice}</div>
                          <div className="sd-amount-lbl">Total</div>
                        </div>
                        <div className="sd-amount-box green">
                          <div className="sd-amount-val">₹{o.advancePaid || 0}</div>
                          <div className="sd-amount-lbl">Advance Paid</div>
                        </div>
                        <div className="sd-amount-box orange">
                          <div className="sd-amount-val">₹{o.totalPrice - (o.advancePaid || 0)}</div>
                          <div className="sd-amount-lbl">Baaki Mila</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="sd-stat">
      <div className="sd-stat-icon" style={{ background: color + "20" }}>{icon}</div>
      <div className="sd-stat-val" style={{ color }}>{value}</div>
      <div className="sd-stat-lbl">{label}</div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Nunito:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .sd-root {
    min-height: 100vh;
    background: #f7f8f4;
    font-family: 'Nunito', sans-serif;
  }

  /* CENTER */
  .sd-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
    gap: 12px;
    color: #555;
    text-align: center;
    padding: 20px;
  }
  .sd-center h3 { font-size: 22px; color: #1a3a1a; margin-bottom: 6px; }

  .sd-big-spinner {
    width: 40px; height: 40px;
    border: 4px solid #eee;
    border-top-color: #2d5a27;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* HERO */
  .sd-hero {
    background: linear-gradient(135deg, #1a3a1a, #2d5a27);
    padding: clamp(24px, 4vw, 48px) clamp(16px, 4vw, 48px);
  }

  .sd-hero-thok {
    background: linear-gradient(135deg, #7c2d12, #c2410c);
  }

  .sd-location-pill-thok {
    background: rgba(255,255,255,0.12);
    border-color: rgba(255,255,255,0.2);
    color: #fed7aa;
  }

  .sd-hero-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;
  }

  .sd-seller-badge {
    display: inline-block;
    background: rgba(255,255,255,0.15);
    color: #a3e6a3;
    padding: 4px 14px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }

  .sd-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(26px, 4vw, 40px);
    color: #fff;
    margin-bottom: 10px;
  }

  .sd-location-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    color: #c6f0c6;
    padding: 6px 16px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
  }

  .sd-stats-row {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }

  .sd-stat {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 18px;
    padding: 16px 24px;
    text-align: center;
    backdrop-filter: blur(10px);
    min-width: 110px;
  }

  .sd-stat-icon { font-size: 24px; margin-bottom: 6px; }
  .sd-stat-val { font-size: 28px; font-weight: 800; font-family: 'Playfair Display', serif; }
  .sd-stat-lbl { font-size: 11px; color: rgba(255,255,255,0.6); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }

  /* BODY */
  .sd-body {
    max-width: 1100px;
    margin: 0 auto;
    padding: clamp(20px, 3vw, 40px) clamp(16px, 3vw, 40px);
  }

  /* TABS */
  .sd-tabs {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }

  .sd-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 14px;
    border: 2px solid #e0e0d8;
    background: #fff;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #555;
    cursor: pointer;
    transition: all 0.2s;
  }

  .sd-tab.active {
    background: #2d5a27;
    color: #fff;
    border-color: #2d5a27;
  }

  .sd-tab.active-thok {
    background: #c2410c;
    color: #fff;
    border-color: #c2410c;
  }

  .sd-tab-count {
    background: rgba(255,255,255,0.25);
    padding: 2px 8px;
    border-radius: 100px;
    font-size: 12px;
  }

  .sd-tab:not(.active) .sd-tab-count {
    background: #f0f0ea;
    color: #888;
  }

  .sd-add-btn {
    margin-left: auto;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #fff;
    padding: 10px 20px;
    border-radius: 14px;
    text-decoration: none;
    font-weight: 800;
    font-size: 14px;
    transition: transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 14px rgba(22,163,74,0.3);
  }
  .sd-add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(22,163,74,0.35); }

  .sd-add-btn-thok {
    background: linear-gradient(135deg, #f97316, #c2410c);
    box-shadow: 0 4px 14px rgba(249,115,22,0.3);
  }
  .sd-add-btn-thok:hover { box-shadow: 0 8px 20px rgba(249,115,22,0.4); }

  /* MSG */
  .sd-msg {
    padding: 14px 18px;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
    animation: fadeUp 0.3s ease;
  }
  .sd-msg.success { background: #f0fdf4; border: 1px solid #c6e8c6; color: #16a34a; }
  .sd-msg.error   { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }

  /* EMPTY */
  .sd-empty {
    text-align: center;
    padding: 80px 20px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .sd-empty h3 { font-family: 'Playfair Display', serif; font-size: 24px; color: #1a3a1a; margin: 14px 0 8px; }
  .sd-empty p { color: #888; }

  /* PRODUCTS GRID */
  .sd-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 18px;
  }

  @media (max-width: 480px) {
    .sd-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  }

  .sd-card {
    background: #fff;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.07);
    border: 1px solid rgba(0,0,0,0.04);
    transition: transform 0.2s, box-shadow 0.2s;
    animation: fadeUp 0.3s ease both;
  }
  .sd-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.1); }

  .sd-card-img-wrap { position: relative; }
  .sd-card-img { width: 100%; height: 150px; object-fit: cover; display: block; }
  .sd-card-location {
    position: absolute;
    bottom: 8px; left: 8px;
    background: rgba(0,0,0,0.55);
    color: #fff;
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 8px;
    backdrop-filter: blur(4px);
  }

  .sd-card-body { padding: 14px; }

  .sd-card-name {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sd-card-price {
    font-size: 18px;
    font-weight: 800;
    color: #2d5a27;
    margin-bottom: 12px;
  }
  .sd-card-price span { font-size: 13px; color: #888; font-weight: 600; margin-left: 2px; }

  .sd-card-btns { display: flex; gap: 8px; }

  .sd-edit-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: #888;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 4px;
    margin-top: 10px;
  }

  .sd-edit-input {
    width: 100%;
    padding: 9px 12px;
    border: 1.5px solid #c6e8c6;
    border-radius: 10px;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .sd-edit-input:focus { border-color: #2d5a27; }

  .sd-save-btn {
    flex: 1; padding: 9px;
    background: #2d5a27; color: #fff;
    border: none; border-radius: 10px;
    font-family: 'Nunito', sans-serif;
    font-weight: 700; font-size: 13px; cursor: pointer;
    transition: background 0.15s;
  }
  .sd-save-btn:hover { background: #1a3a1a; }
  .sd-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .sd-cancel-btn {
    flex: 1; padding: 9px;
    background: #f3f4f6; color: #555;
    border: 1px solid #ddd; border-radius: 10px;
    font-family: 'Nunito', sans-serif;
    font-size: 13px; cursor: pointer;
  }

  .sd-edit-btn {
    flex: 1; padding: 9px;
    background: #eff6ff; color: #2563eb;
    border: 1px solid #bfdbfe; border-radius: 10px;
    font-family: 'Nunito', sans-serif;
    font-weight: 700; font-size: 12px; cursor: pointer;
    transition: background 0.15s;
  }
  .sd-edit-btn:hover { background: #dbeafe; }

  .sd-delete-btn {
    flex: 1; padding: 9px;
    background: #fef2f2; color: #dc2626;
    border: 1px solid #fecaca; border-radius: 10px;
    font-family: 'Nunito', sans-serif;
    font-weight: 700; font-size: 12px; cursor: pointer;
    transition: background 0.15s;
  }
  .sd-delete-btn:hover { background: #fee2e2; }

  /* ORDERS */
  .sd-orders { display: flex; flex-direction: column; gap: 18px; }

  .sd-order-card {
    background: #fff;
    border-radius: 20px;
    padding: clamp(18px, 3vw, 28px);
    box-shadow: 0 2px 12px rgba(0,0,0,0.07);
    border: 1px solid rgba(0,0,0,0.04);
    animation: fadeUp 0.3s ease both;
  }

  .sd-order-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;
  }

  .sd-order-name { font-size: 18px; font-weight: 800; color: #1a1a1a; margin-bottom: 6px; }
  .sd-order-contact, .sd-order-address { font-size: 13px; color: #666; margin-top: 3px; }

  .sd-pending-badge {
    background: #fef3c7;
    color: #92400e;
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .sd-order-divider { height: 1px; background: #f0f0ea; margin: 16px 0; }

  .sd-order-items-label { font-size: 12px; font-weight: 700; color: #888; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }

  .sd-order-item { font-size: 14px; color: #555; margin-bottom: 4px; }

  .sd-order-amounts {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 18px;
    margin-bottom: 18px;
  }

  .sd-amount-box {
    flex: 1;
    min-width: 90px;
    background: #f7f8f4;
    border-radius: 14px;
    padding: 12px 16px;
    text-align: center;
    border: 1px solid #e8e8e0;
  }
  .sd-amount-box.green { background: #f0fdf4; border-color: #c6e8c6; }
  .sd-amount-box.orange { background: #fffbeb; border-color: #fde68a; }

  .sd-amount-val { font-size: 18px; font-weight: 800; color: #1a1a1a; }
  .sd-amount-box.green .sd-amount-val { color: #16a34a; }
  .sd-amount-box.orange .sd-amount-val { color: #d97706; }
  .sd-amount-lbl { font-size: 11px; color: #999; font-weight: 600; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

  .sd-deliver-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #2d5a27, #4a9e3f);
    color: #fff;
    border: none;
    border-radius: 14px;
    font-family: 'Nunito', sans-serif;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 14px rgba(45,90,39,0.25);
  }
  .sd-deliver-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(45,90,39,0.3); }

  /* PROGRESS TRACKER */
  .sd-progress-box {
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: 18px;
    padding: 20px 22px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    animation: fadeUp 0.3s ease both;
  }
  .sd-progress-title {
    font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 16px;
  }
  .sd-prog-row {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 12px; flex-wrap: wrap;
  }
  .sd-prog-label {
    font-size: 13px; font-weight: 600; color: #374151; min-width: 130px;
  }
  .sd-bar-wrap {
    flex: 1; min-width: 80px; height: 10px;
    background: #e2e8f0; border-radius: 999px; overflow: hidden;
  }
  .sd-bar-fill { height: 100%; border-radius: 999px; transition: width 0.4s; }
  .sd-prog-count {
    font-size: 13px; font-weight: 700; color: #0f172a; min-width: 24px;
  }
  .sd-prog-badge {
    font-size: 12px; font-weight: 700;
    background: #fef3c7; color: #92400e;
    padding: 3px 10px; border-radius: 999px;
  }
  .sd-badge-ok { background: #dcfce7; color: #166534; }
  .sd-prog-warn {
    font-size: 12px; font-weight: 700; color: #dc2626;
    background: #fef2f2; border: 1px solid #fecaca;
    border-radius: 10px; padding: 8px 12px; margin-top: 4px;
  }
  .sd-daylist-wrap {
    margin-top: 16px; border-top: 1px dashed #e2e8f0; padding-top: 14px;
  }
  .sd-daylist-title {
    font-weight: 700; font-size: 12px; color: #374151; margin-bottom: 10px;
  }
  .sd-daylist-row {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 7px; flex-wrap: wrap;
  }
  .sd-daylist-num {
    font-size: 12px; font-weight: 700; color: #7c3aed;
    background: #ede9fe; padding: 2px 8px; border-radius: 999px; min-width: 60px;
  }
  .sd-daylist-name { font-size: 13px; color: #374151; flex: 1; font-weight: 600; }
  .sd-daylist-date {
    font-size: 12px; color: #64748b; font-weight: 600;
    background: #f1f5f9; padding: 2px 8px; border-radius: 999px;
  }
  .sd-days-tag {
    font-size: 11px; font-weight: 600; color: #64748b;
    background: #f1f5f9; padding: 2px 8px; border-radius: 999px;
    margin-top: 6px; display: inline-block;
  }

  .sd-order-delivered {
    border-left: 4px solid #22c55e;
  }

  .sd-delivered-badge {
    background: #dcfce7;
    color: #166534;
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
  }
`;