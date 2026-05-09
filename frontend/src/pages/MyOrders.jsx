import { useEffect, useState } from "react";
import { auth } from "../firebase";
import axios from "axios";

const API = import.meta.env.VITE_API;

export default function MyOrders(){

  const [orders,setOrders]       = useState([]);
  const [rewards,setRewards]     = useState([]);
  const [screen,setScreen]       = useState(window.innerWidth);

  // ✅ Only for responsiveness (logic untouched)
  useEffect(()=>{
    const handleResize=()=>setScreen(window.innerWidth);
    window.addEventListener("resize",handleResize);
    return ()=>window.removeEventListener("resize",handleResize);
  },[]);

  useEffect(()=>{
    auth.onAuthStateChanged(async(user)=>{
      if(!user) return;

      const res = await axios.get(`${API}/api/orders/user/` + user.uid);
      setOrders(res.data.filter(o => o.totalPrice > 0));

      const rRes = await axios.get(`${API}/api/rewards/my/` + user.uid);
      setRewards(Array.isArray(rRes.data) ? rRes.data : []);
    });
  },[]);

  async function orderAgain(o){

    const { data } = await axios.post(
      `${API}/api/payment/create-order`,
      { price: o.totalPrice }
    );

    const options = {
      key: data.key,
      amount: data.total * 100,
      currency: "INR",
      order_id: data.orderId,

      handler: async (response) => {

        await axios.post(`${API}/api/payment/verify`, response);

        await axios.post(`${API}/api/orders/again`,{
          orderId: o._id
        });

        alert("Order placed again");
        window.location.reload();
      }
    };

    new window.Razorpay(options).open();
  }

  const mobile = screen < 640;

  return(
    <div style={wrap}>

      <h2 style={title}>📦 My Orders</h2>

      {/* Reward codes */}
      {rewards.length > 0 && (
        <div style={rewardBox}>
          <p style={rewardTitle}>🎁 Aapke Reward Codes</p>
          <p style={rewardSub}>Har 3 orders ke baad ek free order milta hai! Bag mein jake code apply karo.</p>
          {rewards.map(r => (
            <div key={r._id} style={rewardRow}>
              <span style={rewardCode}>{r.code}</span>
              <button
                style={copyBtn}
                onClick={() => {
                  navigator.clipboard.writeText(r.code);
                  alert("Code copy ho gaya: " + r.code);
                }}
              >
                📋 Copy
              </button>
            </div>
          ))}
        </div>
      )}

      {orders.map(o=>(

        <div key={o._id} style={card}>

          <div style={row(mobile)}>

            <b>Status</b>

            <span style={{
              ...pill,
              background:o.status==="delivered"?"#dcfce7":"#fef3c7",
              color:o.status==="delivered"?"#166534":"#92400e"
            }}>
              {o.status}
            </span>

          </div>

          <div style={items}>
            {o.items.map((x,i)=>(
              <div key={i} style={itemRow}>
                <span>{x.name}</span>
                <span>× {x.qty}</span>
              </div>
            ))}
          </div>

          <p style={price}>
            ₹{o.totalPrice}
          </p>

          {/* Thok Mandi seller contact — sirf tab dikhao jab order thok se ho */}
          {o.thokSellers && o.thokSellers.length > 0 && (
            <div style={thokBox}>
              <p style={thokTitle}>🏭 Thok Mandi Seller — Contact Karo</p>
              {o.thokSellers.map((s, i) => (
                <div key={i} style={thokRow}>
                  <span style={thokName}>👤 {s.name || "Seller"}</span>
                  {s.phone && (
                    <a href={`tel:${s.phone}`} style={thokPhone}>
                      📞 {s.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {o.status==="delivered" && (
            <button style={btn} onClick={()=>orderAgain(o)}>
              Order Again (Pay 25%)
            </button>
          )}

          {o.status==="pending" && (
            <p style={pending}>
              🕒 Pending Delivery
            </p>
          )}

        </div>

      ))}

    </div>
  );
}

/* 🎨 PROFESSIONAL RESPONSIVE UI (Only Style Changed) */

const wrap={
  padding:"clamp(16px,3vw,40px)",
  background:"#f1f5f9",
  minHeight:"100vh",
  maxWidth:"1100px",
  margin:"auto"
};

const title={
  marginBottom:"24px",
  fontSize:"clamp(20px,2.5vw,28px)",
  fontWeight:"700",
  color:"#0f172a"
};

const card={
  background:"#ffffff",
  padding:"clamp(16px,2vw,24px)",
  borderRadius:"16px",
  marginBottom:"18px",
  boxShadow:"0 10px 25px rgba(0,0,0,.05)",
  border:"1px solid #e2e8f0",
  transition:"0.3s"
};

const row=(mobile)=>({
  display:"flex",
  flexDirection:mobile?"column":"row",
  justifyContent:"space-between",
  alignItems:mobile?"flex-start":"center",
  gap:mobile?6:0
});

const items={
  marginTop:"14px",
  paddingTop:"12px",
  borderTop:"1px dashed #e2e8f0"
};

const itemRow={
  display:"flex",
  justifyContent:"space-between",
  fontSize:"14px",
  color:"#475569",
  marginBottom:"6px"
};

const pill={
  padding:"6px 14px",
  borderRadius:"999px",
  fontSize:"13px",
  fontWeight:"600"
};

const price={
  marginTop:"14px",
  fontWeight:"700",
  fontSize:"18px",
  color:"#020617"
};

const btn={
  marginTop:"16px",
  width:"100%",
  background:"linear-gradient(135deg,#2563eb,#1d4ed8)",
  color:"#fff",
  border:"none",
  padding:"13px",
  borderRadius:"12px",
  fontSize:"15px",
  cursor:"pointer",
  fontWeight:"600",
  boxShadow:"0 8px 20px rgba(37,99,235,.25)"
};

const pending={
  marginTop:"12px",
  color:"#b45309",
  fontWeight:"500"
};

const thokBox={
  marginTop:"14px",
  background:"#fff7ed",
  border:"1px solid #fed7aa",
  borderRadius:"12px",
  padding:"12px 16px"
};

const thokTitle={
  fontWeight:"700",
  fontSize:"13px",
  color:"#c2410c",
  marginBottom:"8px"
};

const thokRow={
  display:"flex",
  alignItems:"center",
  gap:"14px",
  marginBottom:"4px"
};

const thokName={
  fontSize:"14px",
  color:"#374151",
  fontWeight:"600"
};

const rewardBox={
  background:"#faf5ff",
  border:"1.5px solid #d8b4fe",
  borderRadius:16,
  padding:"18px 20px",
  marginBottom:24
};
const rewardTitle={ fontWeight:800, fontSize:16, color:"#7c3aed", marginBottom:6 };
const rewardSub={ fontSize:13, color:"#6b7280", marginBottom:14 };
const rewardRow={ display:"flex", alignItems:"center", gap:12, marginBottom:10 };
const rewardCode={
  fontFamily:"monospace", fontSize:18, fontWeight:800,
  color:"#6d28d9", letterSpacing:2,
  background:"#ede9fe", padding:"8px 16px", borderRadius:10
};
const copyBtn={
  padding:"8px 14px", background:"#7c3aed", color:"#fff",
  border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:13
};

const thokPhone={
  fontSize:"14px",
  color:"#c2410c",
  fontWeight:"700",
  textDecoration:"none",
  background:"#ffedd5",
  padding:"4px 12px",
  borderRadius:"100px",
  border:"1px solid #fed7aa"
};
