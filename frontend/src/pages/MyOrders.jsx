import { useEffect, useState } from "react";
import { auth } from "../firebase";
import axios from "axios";

const API = import.meta.env.VITE_API;

export default function MyOrders(){

  const [orders,setOrders]             = useState([]);
  const [rewards,setRewards]           = useState([]);
  const [rewardEarnedCount,setRewardEarnedCount] = useState(0);
  const [screen,setScreen]             = useState(window.innerWidth);
  const [rewardInput,setRewardInput]   = useState("");
  const [rewardMsg,setRewardMsg]       = useState(null);
  const [rewardChecking,setRewardChecking] = useState(false);
  const [currentUid,setCurrentUid]     = useState(null);

  // ✅ Only for responsiveness (logic untouched)
  useEffect(()=>{
    const handleResize=()=>setScreen(window.innerWidth);
    window.addEventListener("resize",handleResize);
    return ()=>window.removeEventListener("resize",handleResize);
  },[]);

  useEffect(()=>{
    auth.onAuthStateChanged(async(user)=>{
      if(!user) return;
      setCurrentUid(user.uid);

      const res = await axios.get(`${API}/api/orders/user/` + user.uid);
      setOrders(res.data.filter(o => o.totalPrice > 0));

      const rRes = await axios.get(`${API}/api/rewards/my/` + user.uid);
      setRewards(Array.isArray(rRes.data) ? rRes.data : []);

      const cRes = await axios.get(`${API}/api/rewards/count/` + user.uid);
      setRewardEarnedCount(cRes.data.count || 0);
    });
  },[]);

  async function applyRewardCode(){
    if(!rewardInput.trim()) return;
    if(!currentUid){ setRewardMsg({type:"err",text:"Pehle login karo"}); return; }
    setRewardChecking(true);
    setRewardMsg(null);
    try{
      await axios.post(`${API}/api/rewards/validate`,{
        code: rewardInput.trim().toUpperCase(),
        uid: currentUid
      });
      setRewardMsg({type:"ok", text:"✅ Code valid hai! Bag mein jake use karo."});
    }catch(e){
      setRewardMsg({type:"err", text: e?.response?.data?.error || "❌ Code galat hai ya pehle use ho chuka hai"});
    }finally{
      setRewardChecking(false);
    }
  }

  function daysAgo(dateStr){
    const d = Math.floor((Date.now() - new Date(dateStr)) / (1000*60*60*24));
    if(d === 0) return "Aaj";
    if(d === 1) return "1 din pehle";
    return d + " din pehle";
  }

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

      {/* Earned reward codes */}
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

      {/* Reward progress tracker — unique order days system */}
      {(()=>{
        const MILESTONES = [3, 6, 18, 36];
        function getThreshold(n){
          if(n < MILESTONES.length) return MILESTONES[n];
          let t = 36;
          for(let i = MILESTONES.length; i <= n; i++) t *= 2;
          return t;
        }

        const uniqueDaySet = new Set(orders.map(o => new Date(o.createdAt).toDateString()));
        const uniqueDays   = uniqueDaySet.size;
        const nextT        = getThreshold(rewardEarnedCount);
        const daysLeft     = Math.max(0, nextT - uniqueDays);
        const pct          = Math.min((uniqueDays / nextT) * 100, 100);

        // Chain: show fixed 4 + next if beyond
        const chainEnd = Math.max(rewardEarnedCount + 1, MILESTONES.length);
        const chain    = Array.from({length: chainEnd}, (_, i) => getThreshold(i));

        return (
          <div style={progressBox}>
            <p style={progressTitle}>🏆 Reward Progress — Alag Din Pe Order Karo</p>

            {/* Milestone chain — numbered rewards */}
            <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:16}}>
              {chain.map((t, i) => {
                const done    = uniqueDays >= t;
                const current = t === nextT;
                return (
                  <span key={t} style={{
                    padding:"5px 13px", borderRadius:999, fontSize:13, fontWeight:800,
                    background: done ? "#dcfce7" : current ? "#fef3c7" : "#f1f5f9",
                    color:      done ? "#166534" : current ? "#92400e" : "#94a3b8",
                    border:     current ? "2px solid #f59e0b" : "2px solid transparent",
                    transition: "0.3s"
                  }}>
                    {done ? "✅" : current ? "🎯" : "⏳"} {i + 1}
                  </span>
                );
              })}
            </div>
            <p style={{fontSize:12, color:"#94a3b8", marginBottom:12}}>
              {chain.map((t, i) => `${i+1} = ${t} din`).join("  •  ")}
            </p>

            {/* Progress bar */}
            <div style={progressRow}>
              <span style={progressLabel}>📅 Unique Din:</span>
              <div style={barWrap}>
                <div style={{...barFill, width:`${pct}%`, background: daysLeft===0?"#16a34a":"#f59e0b"}}/>
              </div>
              <span style={progressCount}>{uniqueDays}/{nextT}</span>
              {daysLeft === 0
                ? <span style={okBadge}>🎁 Reward Ready!</span>
                : <span style={pendingBadge}>⏳ {daysLeft} din aur</span>}
            </div>

            <p style={{marginTop:10, fontSize:12, color:"#6b7280"}}>
              {daysLeft === 0
                ? "🎉 Next order pe reward code milega!"
                : `Alag-alag ${daysLeft} aur din par order karo — next reward milega ${nextT} unique din pe!`}
            </p>

            {/* Per-order day list */}
            <div style={{marginTop:14, borderTop:"1px dashed #e2e8f0", paddingTop:12}}>
              <p style={{fontWeight:700, fontSize:12, color:"#374151", marginBottom:8}}>
                📋 Order Din List ({uniqueDays} unique din)
              </p>
              {[...orders].reverse().map((o, i) => (
                <div key={o._id} style={dayListRow}>
                  <span style={dayListNum}>Order {i+1}</span>
                  <span style={dayListName}>
                    {o.items?.[0]?.name || "Order"}{o.items?.length > 1 ? ` +${o.items.length-1}` : ""}
                  </span>
                  <span style={dayListDate}>{daysAgo(o.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {orders.map(o=>(

        <div key={o._id} style={card}>

          <div style={row(mobile)}>

            <div>
              <b>Status</b>
              <span style={dinTag}>{daysAgo(o.createdAt)}</span>
            </div>

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

const inputBox={
  background:"#f0fdf4",
  border:"1.5px solid #86efac",
  borderRadius:16,
  padding:"18px 20px",
  marginBottom:24
};
const inputTitle={ fontWeight:800, fontSize:15, color:"#166534", marginBottom:12 };
const inputRow={ display:"flex", gap:10 };
const codeInput={
  flex:1,
  padding:"11px 14px",
  borderRadius:10,
  border:"1.5px solid #86efac",
  fontSize:15,
  fontFamily:"monospace",
  fontWeight:700,
  letterSpacing:1,
  outline:"none"
};
const applyBtn={
  padding:"11px 20px",
  background:"linear-gradient(135deg,#16a34a,#15803d)",
  color:"#fff",
  border:"none",
  borderRadius:10,
  fontWeight:700,
  fontSize:14,
  cursor:"pointer"
};

const dinTag={
  marginLeft:8, fontSize:11, fontWeight:600,
  color:"#64748b", background:"#f1f5f9",
  padding:"2px 8px", borderRadius:999
};

const progressBox={
  background:"#fff",
  border:"1.5px solid #e2e8f0",
  borderRadius:16,
  padding:"18px 20px",
  marginBottom:24,
  boxShadow:"0 4px 12px rgba(0,0,0,.04)"
};
const progressTitle={ fontWeight:800, fontSize:15, color:"#0f172a", marginBottom:14 };
const progressRow={
  display:"flex", alignItems:"center", gap:10,
  marginBottom:10, flexWrap:"wrap"
};
const progressLabel={ fontSize:13, fontWeight:600, color:"#374151", minWidth:110 };
const progressCount={ fontSize:13, fontWeight:700, color:"#0f172a", minWidth:28 };
const barWrap={
  flex:1, minWidth:80, height:10,
  background:"#e2e8f0", borderRadius:999, overflow:"hidden"
};
const barFill={ height:"100%", borderRadius:999, transition:"width 0.4s" };
const okBadge={
  fontSize:12, fontWeight:700, color:"#16a34a",
  background:"#dcfce7", padding:"3px 10px", borderRadius:999
};
const pendingBadge={
  fontSize:12, fontWeight:600, color:"#92400e",
  background:"#fef3c7", padding:"3px 10px", borderRadius:999
};
const dayListRow={
  display:"flex", alignItems:"center", gap:10,
  marginBottom:6, flexWrap:"wrap"
};
const dayListNum={
  fontSize:12, fontWeight:700, color:"#7c3aed",
  background:"#ede9fe", padding:"2px 8px", borderRadius:999, minWidth:56
};
const dayListName={ fontSize:13, color:"#374151", flex:1 };
const dayListDate={ fontSize:12, color:"#64748b", fontWeight:600 };

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
