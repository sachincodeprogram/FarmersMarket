import { useEffect, useState } from "react";
import { getBagItems, removeQtyApi } from "../api/bagApi";
import { auth } from "../firebase";
import axios from "axios";

const API = import.meta.env.VITE_API;

export default function Bag() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [paying, setPaying]     = useState(false);
  const [step, setStep]         = useState("bag"); // "bag" | "payment" | "success"
  const [payInfo, setPayInfo]   = useState(null);  // { orderId, advance, fee, total, key }

  async function fetchBag() {
    const data = await getBagItems();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchBag(); }, []);

  async function removeOneQty(item) {
    await removeQtyApi(item.productId, item.price);
    fetchBag();
  }

  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);

  // ── STEP 1: Create Razorpay order (5% advance + charges)
  async function initiatePayment() {
    if (items.length === 0) return;
    try {
      setPaying(true);
      const res = await axios.post(`${API}/api/payment/create-order`, {
        price: totalPrice,
      });
      setPayInfo(res.data);
      setStep("payment");
    } catch (err) {
      console.log(err);
      alert("Payment shuru nahi ho saka. Dobara try karo.");
    } finally {
      setPaying(false);
    }
  }

  // ── STEP 2: Open Razorpay checkout
  function openRazorpay() {
    if (!payInfo) return;

    const options = {
      key: payInfo.key,
      amount: Math.round(payInfo.total * 100),
      currency: "INR",
      name: "Farmer Market",
      description: `Advance Payment (5%) — ₹${payInfo.advance}`,
      order_id: payInfo.orderId,
      handler: async function (response) {
        // ── STEP 3: Verify payment
        try {
          const verify = await axios.post(`${API}/api/payment/verify`, response);
          if (verify.data.success) {
            // ── STEP 4: Create order in DB
            const uid = auth.currentUser?.uid;
            await axios.post(`${API}/api/orders/create`, {
              uid,
              advance: payInfo.advance,
              totalPrice,
            });
            setStep("success");
          } else {
            alert("Payment verify nahi hua. Support se contact karo.");
          }
        } catch (err) {
          console.log(err);
          alert("Order confirm nahi hua. Support se contact karo.");
        }
      },
      prefill: {
        name: auth.currentUser?.displayName || "",
        contact: "",
      },
      theme: { color: "#2d5a27" },
      modal: {
        ondismiss: function () {
          setStep("bag");
          setPaying(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={{ color: "#666", marginTop: 14 }}>Bag load ho rahi hai...</p>
      </div>
    );
  }

  // ── SUCCESS SCREEN
  if (step === "success") {
    return (
      <>
        <RazorpayScript />
        <style>{css}</style>
        <div className="bag-root">
          <div className="bag-success">
            <div className="bag-success-icon">🎉</div>
            <h2>Order Confirm Ho Gaya!</h2>
            <p>Aapka advance payment receive ho gaya.<br />Kisan jald deliver karega.</p>
            <a href="/orders" className="bag-success-btn">Mere Orders Dekho →</a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <RazorpayScript />
      <style>{css}</style>
      <div className="bag-root">

        {/* Header */}
        <div className="bag-header">
          <h1 className="bag-title">🛒 Aapki Bag</h1>
          {items.length > 0 && (
            <span className="bag-count">{items.length} item{items.length > 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Empty */}
        {items.length === 0 ? (
          <div className="bag-empty">
            <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
            <h3>Bag Khali Hai</h3>
            <p>Home se products add karo</p>
            <a href="/" className="bag-empty-btn">Products Dekho</a>
          </div>
        ) : (
          <div className="bag-layout">

            {/* Items */}
            <div className="bag-items">
              {items.map(item => (
                <div key={item._id} className="bag-item">
                  <img src={item.image} alt={item.name} className="bag-item-img" />
                  <div className="bag-item-info">
                    <div className="bag-item-name">{item.name}</div>
                    <div className="bag-item-qty">Qty: {item.qty}</div>
                    <div className="bag-item-price">₹{item.price}</div>
                  </div>
                  <button
                    className="bag-remove-btn"
                    onClick={() => removeOneQty(item)}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Summary + Payment */}
            <div className="bag-sidebar">
              <div className="bag-summary-card">
                <h3 className="bag-summary-title">Order Summary</h3>

                <div className="bag-summary-row">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>

                {/* Payment breakdown preview */}
                <div className="bag-advance-info">
                  <div className="bag-advance-row">
                    <span>Advance (5%)</span>
                    <span>₹{Math.round(totalPrice * 0.05)}</span>
                  </div>
                  <div className="bag-advance-row small">
                    <span>Razorpay charges (~2%)</span>
                    <span>~₹{Math.ceil(totalPrice * 0.05 * 0.02)}</span>
                  </div>
                  <div className="bag-advance-row balance">
                    <span>Baaki (delivery par)</span>
                    <span>₹{Math.round(totalPrice * 0.95)}</span>
                  </div>
                </div>

                <div className="bag-total-row">
                  <span>Abhi Pay Karo</span>
                  <span>₹{Math.round(totalPrice * 0.05 * 1.02)}</span>
                </div>

                {step === "bag" && (
                  <button
                    className="bag-pay-btn"
                    onClick={initiatePayment}
                    disabled={paying}
                  >
                    {paying ? (
                      <><span className="btn-spinner" /> Processing...</>
                    ) : (
                      <>💳 Razorpay Se Pay Karo</>
                    )}
                  </button>
                )}

                {step === "payment" && payInfo && (
                  <div className="bag-payment-ready">
                    <div className="bag-payment-info">
                      <div>✅ Order Ready</div>
                      <div className="bag-payment-amount">Pay: ₹{Math.round(payInfo.total)}</div>
                    </div>
                    <button className="bag-rzp-btn" onClick={openRazorpay}>
                      🔓 Razorpay Kholo
                    </button>
                    <button
                      className="bag-cancel-btn"
                      onClick={() => setStep("bag")}
                    >
                      Wapas Jao
                    </button>
                  </div>
                )}

                <p className="bag-note">
                  ℹ️ Sirf 5% advance abhi pay karo. Baaki payment delivery ke waqt.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}

function RazorpayScript() {
  useEffect(() => {
    if (document.getElementById("rzp-script")) return;
    const s = document.createElement("script");
    s.id  = "rzp-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.head.appendChild(s);
  }, []);
  return null;
}

const styles = {
  center: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    minHeight: "60vh",
  },
  spinner: {
    width: 36, height: 36,
    border: "4px solid #eee",
    borderTopColor: "#2d5a27",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Nunito:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .bag-root {
    min-height: 100vh;
    background: #f7f8f4;
    font-family: 'Nunito', sans-serif;
    padding: clamp(20px, 4vw, 48px) clamp(16px, 4vw, 40px);
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .bag-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 28px;
  }

  .bag-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(24px, 4vw, 36px);
    color: #1a3a1a;
  }

  .bag-count {
    background: #2d5a27;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 100px;
  }

  /* Empty */
  .bag-empty {
    text-align: center;
    padding: 80px 20px;
  }
  .bag-empty h3 {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    margin-bottom: 8px;
    color: #333;
  }
  .bag-empty p { color: #888; margin-bottom: 24px; }
  .bag-empty-btn {
    display: inline-block;
    background: #2d5a27;
    color: #fff;
    padding: 12px 28px;
    border-radius: 14px;
    text-decoration: none;
    font-weight: 700;
    font-size: 15px;
  }

  /* Layout */
  .bag-layout {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 24px;
    align-items: start;
    max-width: 1100px;
    margin: 0 auto;
  }

  @media (max-width: 860px) {
    .bag-layout { grid-template-columns: 1fr; }
  }

  /* Items */
  .bag-items { display: flex; flex-direction: column; gap: 14px; }

  .bag-item {
    background: #fff;
    border-radius: 18px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    border: 1px solid rgba(0,0,0,0.04);
    transition: box-shadow 0.2s;
  }
  .bag-item:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); }

  .bag-item-img {
    width: clamp(60px, 10vw, 80px);
    height: clamp(60px, 10vw, 80px);
    border-radius: 12px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .bag-item-info { flex: 1; min-width: 0; }
  .bag-item-name {
    font-weight: 700;
    font-size: clamp(15px, 2vw, 17px);
    color: #1a1a1a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bag-item-qty { font-size: 13px; color: #888; margin: 3px 0; }
  .bag-item-price { font-size: 17px; font-weight: 800; color: #2d5a27; }

  .bag-remove-btn {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    width: 34px; height: 34px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .bag-remove-btn:hover { background: #fee2e2; }

  /* Sidebar */
  .bag-summary-card {
    background: #fff;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border: 1px solid rgba(0,0,0,0.05);
    position: sticky;
    top: 80px;
  }

  .bag-summary-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    color: #1a3a1a;
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 2px solid #f0f0ea;
  }

  .bag-summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #555;
    margin-bottom: 14px;
    font-weight: 600;
  }

  .bag-advance-info {
    background: #f8fdf8;
    border: 1px solid #c6e8c6;
    border-radius: 12px;
    padding: 12px 14px;
    margin-bottom: 14px;
  }

  .bag-advance-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #444;
    margin-bottom: 6px;
    font-weight: 600;
  }
  .bag-advance-row:last-child { margin-bottom: 0; }
  .bag-advance-row.small { color: #888; font-size: 12px; font-weight: 500; }
  .bag-advance-row.balance { color: #d97706; border-top: 1px dashed #ddd; padding-top: 8px; margin-top: 4px; }

  .bag-total-row {
    display: flex;
    justify-content: space-between;
    font-size: 17px;
    font-weight: 800;
    color: #1a3a1a;
    margin-bottom: 18px;
    padding-top: 12px;
    border-top: 2px solid #f0f0ea;
  }

  .bag-pay-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #2d5a27, #4a9e3f);
    color: #fff;
    border: none;
    border-radius: 16px;
    font-family: 'Nunito', sans-serif;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(45,90,39,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .bag-pay-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(45,90,39,0.35);
  }
  .bag-pay-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }

  .bag-payment-ready { animation: fadeUp 0.3s ease; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .bag-payment-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f0fdf0;
    border: 1px solid #c6e8c6;
    border-radius: 12px;
    padding: 12px 16px;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 700;
    color: #1a3a1a;
  }

  .bag-payment-amount { font-size: 18px; color: #2d5a27; }

  .bag-rzp-btn {
    width: 100%;
    padding: 14px;
    background: #2d5a27;
    color: #fff;
    border: none;
    border-radius: 14px;
    font-family: 'Nunito', sans-serif;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    margin-bottom: 10px;
    transition: background 0.15s;
  }
  .bag-rzp-btn:hover { background: #1a3a1a; }

  .bag-cancel-btn {
    width: 100%;
    padding: 11px;
    background: #f3f4f6;
    color: #555;
    border: 1px solid #ddd;
    border-radius: 12px;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    cursor: pointer;
  }

  .bag-note {
    margin-top: 14px;
    font-size: 12px;
    color: #888;
    line-height: 1.5;
    text-align: center;
  }

  /* Success */
  .bag-success {
    max-width: 400px;
    margin: 80px auto;
    text-align: center;
    background: #fff;
    border-radius: 24px;
    padding: 48px 32px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  }
  .bag-success-icon { font-size: 64px; margin-bottom: 16px; }
  .bag-success h2 {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    color: #1a3a1a;
    margin-bottom: 10px;
  }
  .bag-success p { color: #666; line-height: 1.6; margin-bottom: 28px; }
  .bag-success-btn {
    display: inline-block;
    background: #2d5a27;
    color: #fff;
    padding: 14px 32px;
    border-radius: 14px;
    text-decoration: none;
    font-weight: 800;
    font-size: 15px;
  }
`;