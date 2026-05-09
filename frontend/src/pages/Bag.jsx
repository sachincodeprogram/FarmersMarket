import { useEffect, useState } from "react";
import { getBagItems, removeQtyApi } from "../api/bagApi";
import { auth } from "../firebase";
import axios from "axios";

const API = import.meta.env.VITE_API;

export default function Bag() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [paying, setPaying]       = useState(false);
  const [step, setStep]           = useState("bag");   // "bag" | "success"
  const [lastOrder, setLastOrder] = useState(null);
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

      // Step 1 — create Razorpay order
      const { data: payInfo } = await axios.post(`${API}/api/payment/create-order`, {
        price: totalPrice,
      });

      // Step 2 — open Razorpay immediately
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
            // Step 3 — save order in DB
            const uid  = auth.currentUser?.uid;
            const city = localStorage.getItem("fm_city") || "";
            await axios.post(`${API}/api/orders/create`, {
              uid,
              advance: payInfo.advance,
              totalPrice,
              city,
            });
            // Step 4 — fetch latest order for success screen
            const { data: orders } = await axios.get(`${API}/api/orders/user/${uid}`);
            setLastOrder(Array.isArray(orders) && orders.length > 0 ? orders[0] : null);
            setStep("success");
          } catch (err) {
            console.log(err);
            alert("Order confirm nahi hua. Support se contact karo.");
            setPaying(false);
          }
        },
        prefill: {
          name:    auth.currentUser?.displayName || "",
          contact: "",
        },
        theme: { color: "#16a34a" },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      new window.Razorpay(options).open();

    } catch (err) {
      console.log(err);
      alert("Kuch galat hua. Dobara try karo.");
      setPaying(false);
    }
  }

  // ── LOADING
  if (loading) {
    return (
      <div style={s.center}>
        <div style={s.spinner} />
        <p style={{ color: "#888", marginTop: 14 }}>Bag load ho rahi hai...</p>
      </div>
    );
  }

  // ── SUCCESS SCREEN
  if (step === "success") {
    const thokSellers = lastOrder?.thokSellers || [];
    return (
      <>
        <RzpScript />
        <style>{css}</style>
        <div className="bag-root">
          <div className="bag-success-card">

            <div className="bag-success-icon">✅</div>
            <h2 className="bag-success-title">Your Order Confirmed!</h2>
            <p className="bag-success-sub">
              Aapka advance payment receive ho gaya.<br />
              Kisan jald hi aapka order deliver karega.
            </p>

            {/* Amount summary */}
            <div className="bag-success-amounts">
              <div className="bag-success-row">
                <span>Advance Paid</span>
                <span className="green">₹{lastOrder?.advancePaid || advanceAmt}</span>
              </div>
              <div className="bag-success-row">
                <span>Delivery Par Dena Hoga</span>
                <span className="orange">₹{lastOrder ? lastOrder.totalPrice - (lastOrder.advancePaid || 0) : onDelivery}</span>
              </div>
            </div>

            {/* Thok seller contact */}
            {thokSellers.length > 0 && (
              <div className="bag-seller-contact">
                <p className="bag-seller-contact-title">🏭 Thok Mandi Seller — Contact Karo</p>
                {thokSellers.map((s, i) => (
                  <div key={i} className="bag-seller-row">
                    <span className="bag-seller-name">👤 {s.name || "Seller"}</span>
                    {s.phone && (
                      <a href={`tel:${s.phone}`} className="bag-seller-phone">
                        📞 {s.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            <a href="/orders" className="bag-view-orders-btn">
              📦 Mere Orders Dekho →
            </a>

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
      <div className="bag-root">

        <div className="bag-header">
          <h1 className="bag-title">🛒 Aapki Bag</h1>
          {items.length > 0 && (
            <span className="bag-count">{items.length} item{items.length > 1 ? "s" : ""}</span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bag-empty">
            <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
            <h3>Bag Khali Hai</h3>
            <p>Home se taaza products add karo</p>
            <a href="/" className="bag-empty-btn">Products Dekho →</a>
          </div>
        ) : (
          <div className="bag-layout">

            {/* Items list */}
            <div className="bag-items">
              {items.map(item => (
                <div key={item._id} className="bag-item">
                  <img src={item.image} alt={item.name} className="bag-item-img" />
                  <div className="bag-item-info">
                    <div className="bag-item-name">{item.name}</div>
                    <div className="bag-item-qty">Qty: {item.qty}</div>
                    <div className="bag-item-price">₹{item.price}</div>
                  </div>
                  <button className="bag-remove-btn" onClick={() => removeOneQty(item)}>✕</button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bag-sidebar">
              <div className="bag-summary-card">
                <h3 className="bag-summary-title">Order Summary</h3>

                <div className="bag-summary-row">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>

                <div className="bag-breakdown">
                  <div className="bag-breakdown-row">
                    <span>Advance ({advanceRate === 0.12 ? "12%" : "5%"})</span>
                    <span>₹{advanceAmt}</span>
                  </div>
                  <div className="bag-breakdown-row muted">
                    <span>Razorpay Charges</span>
                    <span>₹{rzpFee}</span>
                  </div>
                  <div className="bag-breakdown-row delivery">
                    <span>Delivery par baaki</span>
                    <span>₹{onDelivery}</span>
                  </div>
                </div>

                <div className="bag-pay-now-row">
                  <span>Abhi Pay Karo</span>
                  <span>₹{payNow}</span>
                </div>

                <p className="bag-trust-text">
                  🔒 Sirf advance abhi pay karo — Your Order ke baad kisan ki Details dikhegi. Baaki payment delivery ke waqt kisan ko dena hoga.
                </p>

                {/* Reward Code */}
                {!rewardApplied ? (
                  <div className="bag-reward-wrap">
                    <p className="bag-reward-label">🎁 Reward Code Hai?</p>
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
                    🎉 Reward Code Apply! Yeh order bilkul FREE hai — koi advance nahi!
                  </div>
                )}

                {rewardApplied ? (
                  <button
                    className="bag-confirm-btn bag-free-btn"
                    onClick={handleFreeOrder}
                    disabled={paying}
                  >
                    {paying
                      ? <><span className="btn-spinner" /> Placing...</>
                      : <>🎁 Free Order Place Karo</>
                    }
                  </button>
                ) : (
                  <button
                    className="bag-confirm-btn"
                    onClick={handleConfirmOrder}
                    disabled={paying}
                  >
                    {paying
                      ? <><span className="btn-spinner" /> Processing...</>
                      : <>✅ Confirm Order — ₹{payNow} Pay Karo</>
                    }
                  </button>
                )}

              </div>
            </div>

          </div>
        )}
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

const s = {
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
  spinner: { width: 36, height: 36, border: "4px solid #eee", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Nunito:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes spin  { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

  .bag-root {
    min-height: 100vh;
    background: #f7f8f4;
    font-family: 'Nunito', sans-serif;
    padding: clamp(20px,4vw,48px) clamp(16px,4vw,40px);
  }

  /* Header */
  .bag-header { display:flex; align-items:center; gap:14px; margin-bottom:28px; }
  .bag-title  { font-family:'Playfair Display',serif; font-size:clamp(24px,4vw,36px); color:#1a3a1a; }
  .bag-count  { background:#16a34a; color:#fff; font-size:13px; font-weight:700; padding:4px 12px; border-radius:100px; }

  /* Empty */
  .bag-empty { text-align:center; padding:80px 20px; }
  .bag-empty h3 { font-family:'Playfair Display',serif; font-size:26px; margin-bottom:8px; color:#333; }
  .bag-empty p  { color:#888; margin-bottom:24px; }
  .bag-empty-btn {
    display:inline-block; background:#16a34a; color:#fff;
    padding:12px 28px; border-radius:14px; text-decoration:none;
    font-weight:700; font-size:15px;
  }

  /* Layout */
  .bag-layout {
    display:grid; grid-template-columns:1fr 380px;
    gap:24px; align-items:start; max-width:1100px; margin:0 auto;
  }
  @media (max-width:860px) { .bag-layout { grid-template-columns:1fr; } }

  /* Items */
  .bag-items { display:flex; flex-direction:column; gap:14px; }
  .bag-item {
    background:#fff; border-radius:18px; padding:16px;
    display:flex; align-items:center; gap:16px;
    box-shadow:0 2px 10px rgba(0,0,0,.06); border:1px solid rgba(0,0,0,.04);
    animation:fadeUp 0.3s ease both;
  }
  .bag-item-img  { width:clamp(60px,10vw,80px); height:clamp(60px,10vw,80px); border-radius:12px; object-fit:cover; flex-shrink:0; }
  .bag-item-info { flex:1; min-width:0; }
  .bag-item-name { font-weight:700; font-size:clamp(15px,2vw,17px); color:#1a1a1a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .bag-item-qty  { font-size:13px; color:#888; margin:3px 0; }
  .bag-item-price{ font-size:17px; font-weight:800; color:#16a34a; }
  .bag-remove-btn{
    background:#fef2f2; border:1px solid #fecaca; color:#dc2626;
    width:34px; height:34px; border-radius:10px; cursor:pointer;
    font-size:14px; font-weight:700; flex-shrink:0;
  }

  /* Sidebar */
  .bag-summary-card {
    background:#fff; border-radius:20px; padding:24px;
    box-shadow:0 4px 20px rgba(0,0,0,.08); border:1px solid rgba(0,0,0,.05);
    position:sticky; top:80px;
  }
  .bag-summary-title {
    font-family:'Playfair Display',serif; font-size:20px; color:#1a3a1a;
    margin-bottom:18px; padding-bottom:14px; border-bottom:2px solid #f0f0ea;
  }
  .bag-summary-row {
    display:flex; justify-content:space-between;
    font-size:15px; font-weight:700; color:#333; margin-bottom:14px;
  }

  /* Breakdown */
  .bag-breakdown {
    background:#f8fdf8; border:1px solid #c6e8c6;
    border-radius:12px; padding:14px; margin-bottom:14px;
  }
  .bag-breakdown-row {
    display:flex; justify-content:space-between;
    font-size:13px; font-weight:600; color:#374151; margin-bottom:8px;
  }
  .bag-breakdown-row:last-child { margin-bottom:0; }
  .bag-breakdown-row.muted  { color:#888; font-size:12px; font-weight:500; }
  .bag-breakdown-row.delivery {
    color:#d97706; font-weight:700;
    border-top:1px dashed #d1d5db; padding-top:8px; margin-top:4px;
  }

  .bag-pay-now-row {
    display:flex; justify-content:space-between;
    font-size:20px; font-weight:800; color:#1a3a1a;
    margin-bottom:14px; padding-top:14px; border-top:2px solid #f0f0ea;
  }

  .bag-trust-text {
    font-size:12px; color:#6b7280; text-align:center;
    margin-bottom:18px; line-height:1.5;
    background:#f9fafb; padding:10px 12px; border-radius:10px;
  }

  /* CONFIRM BUTTON — big and prominent */
  .bag-confirm-btn {
    width:100%; padding:18px;
    background:linear-gradient(135deg,#16a34a,#15803d);
    color:#fff; border:none; border-radius:16px;
    font-family:'Nunito',sans-serif; font-size:17px; font-weight:800;
    cursor:pointer; letter-spacing:0.3px;
    box-shadow:0 6px 20px rgba(22,163,74,.35);
    transition:transform 0.15s, box-shadow 0.2s;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .bag-confirm-btn:hover:not(:disabled) {
    transform:translateY(-2px);
    box-shadow:0 10px 28px rgba(22,163,74,.45);
  }
  .bag-confirm-btn:disabled { opacity:0.6; cursor:not-allowed; }

  .btn-spinner {
    width:16px; height:16px;
    border:2px solid rgba(255,255,255,.4);
    border-top-color:#fff; border-radius:50%;
    animation:spin 0.7s linear infinite; display:inline-block;
  }

  /* SUCCESS SCREEN */
  .bag-success-card {
    max-width:440px; margin:60px auto;
    background:#fff; border-radius:24px; padding:clamp(28px,5vw,48px) clamp(24px,4vw,40px);
    box-shadow:0 12px 40px rgba(0,0,0,.1); text-align:center;
    animation:fadeUp 0.4s ease;
  }
  .bag-success-icon  { font-size:64px; margin-bottom:16px; }
  .bag-success-title { font-family:'Playfair Display',serif; font-size:clamp(22px,4vw,30px); color:#1a3a1a; margin-bottom:10px; }
  .bag-success-sub   { color:#6b7280; font-size:15px; line-height:1.6; margin-bottom:24px; }

  .bag-success-amounts {
    background:#f8fdf8; border:1px solid #c6e8c6;
    border-radius:14px; padding:16px 20px; margin-bottom:20px;
  }
  .bag-success-row {
    display:flex; justify-content:space-between;
    font-size:15px; font-weight:700; color:#374151; margin-bottom:8px;
  }
  .bag-success-row:last-child { margin-bottom:0; }
  .bag-success-row .green  { color:#16a34a; }
  .bag-success-row .orange { color:#d97706; }

  /* Seller contact */
  .bag-seller-contact {
    background:#fff7ed; border:1px solid #fed7aa;
    border-radius:14px; padding:16px; margin-bottom:20px; text-align:left;
  }
  .bag-seller-contact-title {
    font-weight:700; font-size:13px; color:#c2410c; margin-bottom:12px;
  }
  .bag-seller-row { display:flex; align-items:center; gap:12px; margin-bottom:6px; }
  .bag-seller-name  { font-size:14px; font-weight:700; color:#374151; }
  .bag-seller-phone {
    font-size:14px; font-weight:700; color:#c2410c;
    text-decoration:none; background:#ffedd5;
    padding:4px 12px; border-radius:100px; border:1px solid #fed7aa;
  }

  .bag-view-orders-btn {
    display:inline-block; background:#16a34a; color:#fff;
    padding:14px 32px; border-radius:14px; text-decoration:none;
    font-weight:800; font-size:15px;
    box-shadow:0 4px 14px rgba(22,163,74,.3);
  }

  /* Reward code */
  .bag-reward-wrap  { margin-bottom:16px; }
  .bag-reward-label { font-size:13px; font-weight:700; color:#7c3aed; margin-bottom:8px; }
  .bag-reward-row   { display:flex; gap:8px; }
  .bag-reward-input {
    flex:1; padding:11px 14px; border:1.5px solid #ddd8fe;
    border-radius:10px; font-family:'Nunito',sans-serif; font-size:14px;
    outline:none; letter-spacing:1px; text-transform:uppercase;
  }
  .bag-reward-input:focus { border-color:#7c3aed; }
  .bag-reward-btn {
    padding:11px 18px; background:#7c3aed; color:#fff;
    border:none; border-radius:10px; font-family:'Nunito',sans-serif;
    font-weight:700; font-size:14px; cursor:pointer; white-space:nowrap;
  }
  .bag-reward-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .bag-reward-err { font-size:12px; color:#dc2626; margin-top:6px; font-weight:600; }

  .bag-reward-applied {
    background:#f0fdf4; border:1.5px solid #16a34a;
    border-radius:12px; padding:12px 14px;
    font-size:13px; font-weight:700; color:#15803d;
    margin-bottom:16px; text-align:center;
  }

  .bag-free-btn {
    background:linear-gradient(135deg,#7c3aed,#6d28d9) !important;
    box-shadow:0 6px 20px rgba(124,58,237,.35) !important;
  }
  .bag-free-btn:hover:not(:disabled) {
    box-shadow:0 10px 28px rgba(124,58,237,.45) !important;
  }
`;
