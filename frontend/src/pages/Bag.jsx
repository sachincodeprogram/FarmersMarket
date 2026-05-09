import { useEffect, useState } from "react";
import { getBagItems, removeQtyApi } from "../api/bagApi";
import { auth } from "../firebase";
import axios from "axios";

const API = import.meta.env.VITE_API;

export default function Bag() {
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [paying, setPaying]             = useState(false);
  const [step, setStep]                 = useState("bag");
  const [lastOrder, setLastOrder]       = useState(null);
  const [rewardInput, setRewardInput]   = useState("");
  const [rewardApplied, setRewardApplied] = useState(false);
  const [rewardErr, setRewardErr]       = useState("");
  const [rewardChecking, setRewardChecking] = useState(false);

  useEffect(() => { fetchBag(); }, []);

  async function fetchBag() {
    const data = await getBagItems();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function removeOneQty(item) {
    await removeQtyApi(item.productId, item.price);
    fetchBag();
  }

  async function applyRewardCode() {
    const code = rewardInput.trim().toUpperCase();
    if (!code) return;
    try {
      setRewardChecking(true);
      setRewardErr("");
      const uid = auth.currentUser?.uid;
      const { data } = await axios.post(`${API}/api/rewards/validate`, { code, uid });
      if (data.valid) {
        setRewardApplied(true);
        setRewardErr("");
      } else {
        setRewardErr(data.error || "Code invalid hai");
      }
    } catch (err) {
      setRewardErr(err.response?.data?.error || "Code invalid hai");
    } finally {
      setRewardChecking(false);
    }
  }

  async function handleFreeOrder() {
    if (paying) return;
    try {
      setPaying(true);
      const uid  = auth.currentUser?.uid;
      const city = localStorage.getItem("fm_city") || "";
      const { data } = await axios.post(`${API}/api/orders/create`, {
        uid, advance: 0, totalPrice, city,
        rewardCode: rewardInput.trim().toUpperCase(),
      });
      const { data: orders } = await axios.get(`${API}/api/orders/user/${uid}`);
      setLastOrder(Array.isArray(orders) && orders.length > 0 ? orders[0] : null);
      setStep("success");
    } catch (err) {
      alert("Order place nahi hua. Dobara try karo.");
    } finally {
      setPaying(false);
    }
  }

  const totalPrice  = items.reduce((s, i) => s + (i.price || 0), 0);
  const advanceRate = totalPrice < 80 ? 0.12 : 0.05;
  const advanceAmt  = Math.round(totalPrice * advanceRate);
  const rzpFee      = Math.ceil(advanceAmt * 0.02);
  const payNow      = advanceAmt + rzpFee;
  const onDelivery  = totalPrice - advanceAmt;

  async function handleConfirmOrder() {
    if (items.length === 0 || paying) return;
    try {
      setPaying(true);
      const { data: payInfo } = await axios.post(`${API}/api/payment/create-order`, { price: totalPrice });
      const options = {
        key:         payInfo.key,
        amount:      Math.round(payInfo.total * 100),
        currency:    "INR",
        name:        "Kisan Market",
        description: "Order Advance Payment",
        order_id:    payInfo.orderId,
        handler: async function (response) {
          try {
            const verify = await axios.post(`${API}/api/payment/verify`, response);
            if (!verify.data.success) {
              alert("Payment verify nahi hua. Support se contact karo.");
              setPaying(false);
              return;
            }
            const uid  = auth.currentUser?.uid;
            const city = localStorage.getItem("fm_city") || "";
            await axios.post(`${API}/api/orders/create`, { uid, advance: payInfo.advance, totalPrice, city });
            const { data: orders } = await axios.get(`${API}/api/orders/user/${uid}`);
            setLastOrder(Array.isArray(orders) && orders.length > 0 ? orders[0] : null);
            setStep("success");
          } catch (err) {
            alert("Order confirm nahi hua. Support se contact karo.");
            setPaying(false);
          }
        },
        prefill:  { name: auth.currentUser?.displayName || "", contact: "" },
        theme:    { color: "#16a34a" },
        modal:    { ondismiss: () => setPaying(false) },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      alert("Kuch galat hua. Dobara try karo.");
      setPaying(false);
    }
  }

  // ── LOADING
  if (loading) return (
    <div className="bag-wrap">
      <style>{css}</style>
      <div className="bag-loading">
        <div className="bag-spinner" />
        <p>Bag load ho rahi hai...</p>
      </div>
    </div>
  );

  // ── SUCCESS SCREEN
  if (step === "success") {
    const thokSellers = lastOrder?.thokSellers || [];
    return (
      <>
        <RzpScript />
        <style>{css}</style>
        <div className="bag-wrap">
          <div className="bag-success-card">
            <div className="bag-success-icon">✅</div>
            <h2 className="bag-success-title">Order Confirmed!</h2>
            <p className="bag-success-sub">
              Aapka advance payment receive ho gaya.<br />
              Kisan jald hi aapka order deliver karega.
            </p>

            <div className="bag-success-amounts">
              <div className="bag-success-row">
                <span>Advance Paid</span>
                <span className="green">₹{lastOrder?.advancePaid || advanceAmt}</span>
              </div>
              <div className="bag-success-row">
                <span>Dukaan Par Dena Hoga</span>
                <span className="orange">₹{lastOrder ? lastOrder.totalPrice - (lastOrder.advancePaid || 0) : onDelivery}</span>
              </div>
            </div>

            {thokSellers.length > 0 && (
              <div className="bag-seller-contact">
                <p className="bag-seller-contact-title">🏭 Thok Mandi Seller — Contact Karo</p>
                {thokSellers.map((s, i) => (
                  <div key={i} className="bag-seller-row">
                    <span className="bag-seller-name">👤 {s.name || "Seller"}</span>
                    {s.phone && (
                      <a href={`tel:${s.phone}`} className="bag-seller-phone">📞 {s.phone}</a>
                    )}
                  </div>
                ))}
              </div>
            )}

            <a href="/orders" className="bag-view-orders-btn">📦 Mere Orders Dekho →</a>
          </div>
        </div>
      </>
    );
  }

  // ── BAG SCREEN
  return (
    <>
      <RzpScript />
      <style>{css}</style>
      <div className="bag-wrap">

        {/* HERO */}
        <div className="bag-hero">
          <div className="bag-hero-inner">
            <div className="bag-hero-badge">🛒 Shopping Bag</div>
            <h1 className="bag-hero-title">Aapki Bag</h1>
            <p className="bag-hero-sub">
              {items.length === 0
                ? "Abhi koi item nahi — Home se fresh products add karo"
                : `${items.length} item${items.length > 1 ? "s" : ""} — Sirf advance abhi pay karo`}
            </p>
          </div>
        </div>

        <div className="bag-body">

          {items.length === 0 ? (
            <div className="bag-empty">
              <div className="bag-empty-icon">🛒</div>
              <h3 className="bag-empty-title">Bag Khali Hai</h3>
              <p className="bag-empty-sub">Home se taaza products add karo</p>
              <a href="/" className="bag-empty-btn">🌿 Products Dekho →</a>
            </div>
          ) : (
            <div className="bag-layout">

              {/* LEFT — Items */}
              <div className="bag-left">
                <div className="bag-section-hdr">
                  <span className="bag-section-title">Cart Items</span>
                  <span className="bag-section-count">{items.length} items</span>
                </div>
                <div className="bag-items">
                  {items.map((item, idx) => (
                    <div key={item._id} className="bag-item" style={{ animationDelay: `${idx * 0.06}s` }}>
                      <div className="bag-item-img-wrap">
                        <img src={item.image} alt={item.name} className="bag-item-img" />
                      </div>
                      <div className="bag-item-info">
                        <div className="bag-item-name">{item.name}</div>
                        <div className="bag-item-qty">Qty: {item.qty}</div>
                        <div className="bag-item-price">₹{item.price}</div>
                      </div>
                      <button className="bag-remove-btn" onClick={() => removeOneQty(item)} title="Remove">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — Summary */}
              <div className="bag-right">
                <div className="bag-summary-card">
                  <h3 className="bag-summary-title">Order Summary</h3>

                  {/* Subtotal */}
                  <div className="bag-summary-total-row">
                    <span>Subtotal</span>
                    <span className="bag-total-val">₹{totalPrice}</span>
                  </div>

                  {/* Breakdown */}
                  <div className="bag-breakdown">
                    <div className="bag-breakdown-label">Payment Breakdown</div>
                    <div className="bag-breakdown-row">
                      <span>Advance ({advanceRate === 0.12 ? "12%" : "5%"})</span>
                      <span>₹{advanceAmt}</span>
                    </div>
                    <div className="bag-breakdown-row muted">
                      <span>Razorpay Charges</span>
                      <span>₹{rzpFee}</span>
                    </div>
                    <div className="bag-breakdown-divider" />
                    <div className="bag-breakdown-row delivery">
                      <span>🏪 Dukaan Par Dena Hoga</span>
                      <span>₹{onDelivery}</span>
                    </div>
                  </div>

                  {/* Pay Now */}
                  <div className="bag-pay-box">
                    <div className="bag-pay-label">Abhi Pay Karo</div>
                    <div className="bag-pay-amount">₹{payNow}</div>
                  </div>

                  {/* Trust */}
                  <div className="bag-trust">
                    🔒 Sirf advance abhi pay karo — Baaki payment dukaan par jaake kisan ko dena hoga
                  </div>

                  {/* Reward Code */}
                  {!rewardApplied ? (
                    <div className="bag-reward-wrap">
                      <div className="bag-reward-header">
                        <span className="bag-reward-icon">🎁</span>
                        <span className="bag-reward-label">Reward Code Hai? Free Order</span>
                      </div>
                      <div className="bag-reward-row">
                        <input
                          className="bag-reward-input"
                          placeholder="KISANXXXXXX"
                          value={rewardInput}
                          onChange={e => { setRewardInput(e.target.value); setRewardErr(""); }}
                        />
                        <button
                          className="bag-reward-btn"
                          onClick={applyRewardCode}
                          disabled={rewardChecking || !rewardInput.trim()}
                        >
                          {rewardChecking ? "..." : "Apply"}
                        </button>
                      </div>
                      {rewardErr && <p className="bag-reward-err">❌ {rewardErr}</p>}
                    </div>
                  ) : (
                    <div className="bag-reward-applied">
                      <span>🎉</span>
                      <span>Reward Code Apply! Yeh order bilkul FREE hai — koi advance nahi!</span>
                    </div>
                  )}

                  {/* CTA Button */}
                  {rewardApplied ? (
                    <button className="bag-confirm-btn bag-free-btn" onClick={handleFreeOrder} disabled={paying}>
                      {paying
                        ? <><span className="btn-spinner" /> Placing Order...</>
                        : <>🎁 Free Order Place Karo</>
                      }
                    </button>
                  ) : (
                    <button className="bag-confirm-btn" onClick={handleConfirmOrder} disabled={paying}>
                      {paying
                        ? <><span className="btn-spinner" /> Processing...</>
                        : <>✅ Confirm Order — ₹{payNow} Pay Karo</>
                      }
                    </button>
                  )}

                  <p className="bag-secure-note">🛡️ Secured by Razorpay</p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}

function RzpScript() {
  useEffect(() => {
    if (document.getElementById("rzp-script")) return;
    const s  = document.createElement("script");
    s.id  = "rzp-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.head.appendChild(s);
  }, []);
  return null;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Nunito:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes popIn   { from { opacity:0; transform:scale(.92); } to { opacity:1; transform:scale(1); } }

  .bag-wrap { min-height:100vh; background:#f0f4f0; font-family:'Nunito',sans-serif; }

  /* LOADING */
  .bag-loading {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    min-height:70vh; gap:16px; color:#6b7280; font-size:15px;
  }
  .bag-spinner {
    width:40px; height:40px; border:4px solid #e5e7eb;
    border-top-color:#16a34a; border-radius:50%;
    animation:spin .75s linear infinite;
  }

  /* HERO */
  .bag-hero {
    background:linear-gradient(135deg,#0f2d1a 0%,#1a4a2a 55%,#0f3a2a 100%);
    padding:36px 24px 52px; position:relative; overflow:hidden;
  }
  .bag-hero::after {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse at 80% 40%, rgba(52,211,153,.13) 0%, transparent 65%);
    pointer-events:none;
  }
  .bag-hero-inner { max-width:1100px; margin:0 auto; position:relative; z-index:1; }
  .bag-hero-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2);
    color:#d1fae5; font-size:12px; font-weight:700; letter-spacing:.06em;
    padding:5px 14px; border-radius:100px; margin-bottom:14px;
  }
  .bag-hero-title {
    font-family:'Playfair Display',serif; font-size:clamp(26px,4vw,38px);
    font-weight:800; color:#fff; margin-bottom:8px; line-height:1.15;
  }
  .bag-hero-sub { color:rgba(255,255,255,.6); font-size:14px; line-height:1.5; }

  /* BODY */
  .bag-body { padding:28px 20px; max-width:1100px; margin:0 auto; }

  /* EMPTY */
  .bag-empty {
    text-align:center; padding:80px 20px;
    animation:fadeUp .4s ease;
  }
  .bag-empty-icon  { font-size:72px; margin-bottom:18px; }
  .bag-empty-title {
    font-family:'Playfair Display',serif; font-size:28px;
    color:#1a2e1a; margin-bottom:10px;
  }
  .bag-empty-sub   { color:#6b7280; font-size:15px; margin-bottom:28px; }
  .bag-empty-btn {
    display:inline-block; background:linear-gradient(135deg,#16a34a,#15803d);
    color:#fff; padding:14px 32px; border-radius:14px; text-decoration:none;
    font-weight:800; font-size:15px; box-shadow:0 6px 18px rgba(22,163,74,.3);
    transition:transform .15s, box-shadow .2s;
  }
  .bag-empty-btn:hover { transform:translateY(-2px); box-shadow:0 10px 24px rgba(22,163,74,.4); }

  /* LAYOUT */
  .bag-layout {
    display:grid; grid-template-columns:1fr 400px;
    gap:26px; align-items:start;
  }
  @media (max-width:900px) { .bag-layout { grid-template-columns:1fr; } }

  /* SECTION HEADER */
  .bag-section-hdr {
    display:flex; align-items:center; gap:12px; margin-bottom:16px;
  }
  .bag-section-title {
    font-family:'Playfair Display',serif; font-size:18px; color:#1a2e1a; font-weight:800;
  }
  .bag-section-count {
    background:#16a34a; color:#fff; font-size:12px; font-weight:700;
    padding:3px 11px; border-radius:100px;
  }

  /* ITEM CARDS */
  .bag-items { display:flex; flex-direction:column; gap:14px; }
  .bag-item {
    background:#fff; border-radius:20px; padding:16px 18px;
    display:flex; align-items:center; gap:16px;
    box-shadow:0 2px 12px rgba(0,0,0,.07);
    border:1px solid rgba(0,0,0,.04);
    animation:fadeUp .35s ease both;
    transition:box-shadow .2s, transform .2s;
  }
  .bag-item:hover { box-shadow:0 8px 24px rgba(0,0,0,.12); transform:translateY(-2px); }

  .bag-item-img-wrap {
    width:74px; height:74px; border-radius:14px; overflow:hidden;
    flex-shrink:0; background:#f3f4f6;
    box-shadow:0 2px 8px rgba(0,0,0,.1);
  }
  .bag-item-img { width:100%; height:100%; object-fit:cover; }
  .bag-item-info { flex:1; min-width:0; }
  .bag-item-name {
    font-weight:800; font-size:16px; color:#1a1a1a;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    margin-bottom:4px;
  }
  .bag-item-qty  { font-size:13px; color:#9ca3af; margin-bottom:6px; }
  .bag-item-price{
    font-size:18px; font-weight:800; color:#16a34a;
    font-family:'Playfair Display',serif;
  }
  .bag-remove-btn {
    background:#fef2f2; border:1.5px solid #fecaca; color:#dc2626;
    width:36px; height:36px; border-radius:10px; cursor:pointer;
    font-size:14px; font-weight:800; flex-shrink:0;
    transition:background .15s, transform .15s;
  }
  .bag-remove-btn:hover { background:#fee2e2; transform:scale(1.1); }

  /* SUMMARY CARD */
  .bag-summary-card {
    background:#fff; border-radius:22px; padding:26px;
    box-shadow:0 6px 24px rgba(0,0,0,.09);
    border:1px solid rgba(0,0,0,.05);
    position:sticky; top:84px;
    animation:popIn .4s ease;
  }
  .bag-summary-title {
    font-family:'Playfair Display',serif; font-size:21px; color:#1a2e1a;
    font-weight:800; margin-bottom:18px; padding-bottom:16px;
    border-bottom:2px solid #f0f4f0;
  }
  .bag-summary-total-row {
    display:flex; justify-content:space-between;
    font-size:15px; font-weight:700; color:#374151; margin-bottom:16px;
  }
  .bag-total-val { font-size:18px; font-weight:800; color:#1a2e1a; }

  /* BREAKDOWN */
  .bag-breakdown {
    background:#f8fdf8; border:1.5px solid #c6e8c6;
    border-radius:14px; padding:14px 16px; margin-bottom:18px;
  }
  .bag-breakdown-label {
    font-size:11px; font-weight:700; color:#6b7280; letter-spacing:.05em;
    text-transform:uppercase; margin-bottom:10px;
  }
  .bag-breakdown-row {
    display:flex; justify-content:space-between;
    font-size:13px; font-weight:600; color:#374151; margin-bottom:9px;
  }
  .bag-breakdown-row:last-child { margin-bottom:0; }
  .bag-breakdown-row.muted  { color:#9ca3af; font-size:12px; font-weight:500; }
  .bag-breakdown-row.delivery { color:#d97706; font-weight:700; }
  .bag-breakdown-divider { border-top:1px dashed #d1d5db; margin:8px 0 10px; }

  /* PAY BOX */
  .bag-pay-box {
    background:linear-gradient(135deg,#ecfdf5,#d1fae5);
    border:1.5px solid #6ee7b7; border-radius:14px;
    padding:16px 18px; margin-bottom:14px;
    display:flex; justify-content:space-between; align-items:center;
  }
  .bag-pay-label  { font-size:13px; font-weight:700; color:#065f46; }
  .bag-pay-amount { font-family:'Playfair Display',serif; font-size:26px; font-weight:800; color:#065f46; }

  /* TRUST */
  .bag-trust {
    font-size:12px; color:#6b7280; text-align:center;
    line-height:1.55; background:#f9fafb; padding:10px 14px;
    border-radius:10px; margin-bottom:16px;
  }

  /* REWARD */
  .bag-reward-wrap  { margin-bottom:16px; }
  .bag-reward-header {
    display:flex; align-items:center; gap:8px; margin-bottom:10px;
  }
  .bag-reward-icon  { font-size:18px; }
  .bag-reward-label { font-size:13px; font-weight:800; color:#7c3aed; }
  .bag-reward-row   { display:flex; gap:8px; }
  .bag-reward-input {
    flex:1; padding:11px 14px; border:1.5px solid #ddd8fe;
    border-radius:10px; font-family:'Nunito',sans-serif; font-size:14px;
    font-weight:700; outline:none; letter-spacing:1.5px; text-transform:uppercase;
    transition:border .2s;
  }
  .bag-reward-input:focus { border-color:#7c3aed; box-shadow:0 0 0 3px rgba(124,58,237,.1); }
  .bag-reward-btn {
    padding:11px 20px; background:linear-gradient(135deg,#7c3aed,#6d28d9);
    color:#fff; border:none; border-radius:10px;
    font-family:'Nunito',sans-serif; font-weight:700; font-size:14px;
    cursor:pointer; white-space:nowrap; transition:opacity .2s;
  }
  .bag-reward-btn:disabled { opacity:.5; cursor:not-allowed; }
  .bag-reward-err { font-size:12px; color:#dc2626; margin-top:6px; font-weight:600; }
  .bag-reward-applied {
    background:#f5f3ff; border:1.5px solid #a78bfa;
    border-radius:12px; padding:12px 14px;
    font-size:13px; font-weight:700; color:#6d28d9;
    margin-bottom:16px; display:flex; align-items:center; gap:8px;
    animation:fadeUp .3s ease;
  }

  /* CONFIRM BUTTON */
  .bag-confirm-btn {
    width:100%; padding:18px; border:none; border-radius:16px;
    font-family:'Nunito',sans-serif; font-size:17px; font-weight:800;
    cursor:pointer; letter-spacing:.3px; margin-bottom:10px;
    background:linear-gradient(135deg,#16a34a,#15803d); color:#fff;
    box-shadow:0 6px 20px rgba(22,163,74,.35);
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:transform .15s, box-shadow .2s;
  }
  .bag-confirm-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 28px rgba(22,163,74,.45); }
  .bag-confirm-btn:disabled { opacity:.6; cursor:not-allowed; }
  .bag-free-btn {
    background:linear-gradient(135deg,#7c3aed,#6d28d9) !important;
    box-shadow:0 6px 20px rgba(124,58,237,.35) !important;
  }
  .bag-free-btn:hover:not(:disabled) { box-shadow:0 10px 28px rgba(124,58,237,.45) !important; }

  .btn-spinner {
    width:16px; height:16px; border:2px solid rgba(255,255,255,.4);
    border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite;
    display:inline-block;
  }

  .bag-secure-note {
    text-align:center; font-size:12px; color:#9ca3af; font-weight:600; margin-top:4px;
  }

  /* SUCCESS SCREEN */
  .bag-success-card {
    max-width:460px; margin:60px auto;
    background:#fff; border-radius:24px;
    padding:clamp(28px,5vw,48px) clamp(22px,4vw,40px);
    box-shadow:0 12px 40px rgba(0,0,0,.1); text-align:center;
    animation:popIn .4s ease;
  }
  .bag-success-icon  { font-size:70px; margin-bottom:18px; display:block; }
  .bag-success-title {
    font-family:'Playfair Display',serif; font-size:clamp(22px,4vw,30px);
    color:#1a2e1a; margin-bottom:10px; font-weight:800;
  }
  .bag-success-sub   { color:#6b7280; font-size:15px; line-height:1.6; margin-bottom:24px; }
  .bag-success-amounts {
    background:#f8fdf8; border:1.5px solid #c6e8c6;
    border-radius:14px; padding:16px 20px; margin-bottom:20px;
  }
  .bag-success-row {
    display:flex; justify-content:space-between;
    font-size:15px; font-weight:700; color:#374151; margin-bottom:8px;
  }
  .bag-success-row:last-child { margin-bottom:0; }
  .bag-success-row .green  { color:#16a34a; font-size:17px; }
  .bag-success-row .orange { color:#d97706; font-size:17px; }

  .bag-seller-contact {
    background:#fff7ed; border:1.5px solid #fed7aa;
    border-radius:14px; padding:16px; margin-bottom:20px; text-align:left;
  }
  .bag-seller-contact-title { font-weight:800; font-size:13px; color:#c2410c; margin-bottom:12px; }
  .bag-seller-row { display:flex; align-items:center; gap:12px; margin-bottom:6px; }
  .bag-seller-name  { font-size:14px; font-weight:700; color:#374151; }
  .bag-seller-phone {
    font-size:14px; font-weight:700; color:#c2410c; text-decoration:none;
    background:#ffedd5; padding:4px 12px; border-radius:100px; border:1px solid #fed7aa;
    transition:background .15s;
  }
  .bag-seller-phone:hover { background:#fde68a; }

  .bag-view-orders-btn {
    display:inline-block; background:linear-gradient(135deg,#16a34a,#15803d);
    color:#fff; padding:15px 36px; border-radius:14px; text-decoration:none;
    font-weight:800; font-size:15px; box-shadow:0 6px 18px rgba(22,163,74,.3);
    transition:transform .15s, box-shadow .2s;
  }
  .bag-view-orders-btn:hover { transform:translateY(-2px); box-shadow:0 10px 24px rgba(22,163,74,.4); }
`;
