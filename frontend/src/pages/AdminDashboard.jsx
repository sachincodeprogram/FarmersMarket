import { useEffect,useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";   // ✅ CSS Added

const API = import.meta.env.VITE_API;

export default function AdminDashboard(){

  const [data,setData]               = useState({});
  const [sellers,setSellers]         = useState([]);
  const [pending,setPending]         = useState([]);
  const [delivered,setDelivered]     = useState([]);
  const [showPending,setShowPending] = useState(true);
  const [showDelivered,setShowDelivered] = useState(false);

  useEffect(()=>{
    axios.get(`${API}/api/orders/admin/summary`)
      .then(res=>setData(res.data));
    axios.get(`${API}/api/users`)
      .then(res=>setSellers(res.data.filter(u=>u.role==="seller")));
    axios.get(`${API}/api/orders/admin`)
      .then(res=>setPending(Array.isArray(res.data)?res.data:[]));
    axios.get(`${API}/api/orders/admin/delivered`)
      .then(res=>setDelivered(Array.isArray(res.data)?res.data:[]));
  },[]);

  function fmtDate(d){
    return new Date(d).toLocaleDateString("hi-IN",{day:"2-digit",month:"short",year:"numeric"});
  }

  function fmtDateTime(d){
    const dt = new Date(d);
    const date = dt.toLocaleDateString("hi-IN",{day:"2-digit",month:"short",year:"numeric"});
    const time = dt.toLocaleTimeString("hi-IN",{hour:"2-digit",minute:"2-digit",hour12:true});
    return `${date}, ${time}`;
  }

  const citySellers = sellers.filter(u=>!u.sellerType||u.sellerType==="city_seller");
  const thokSellers = sellers.filter(u=>u.sellerType==="thok_seller");

  const max = Math.max(
    data.totalOrders||0,
    data.today||0,
    data.totalSales||0
  );

  return(
    <div style={wrap} className="admindash-wrap">

      <h2 className="admindash-title">📊 Admin Dashboard</h2>

      {/* TOP CARDS */}
      <div style={cards}>
        <Card title="Total Orders" value={data.totalOrders}/>
        <Card title="Total Sales ₹" value={data.totalSales}/>
        <Card title="Today Orders" value={data.today}/>
      </div>

      {/* SELLER TYPE SECTION */}
      <h3 style={{marginTop:36,marginBottom:14,fontSize:17,color:"#374151"}}>👥 Sellers Overview</h3>

      <div style={sellerRow}>

        <div style={{...sellerBox, borderTop:"4px solid #16a34a"}}>
          <p style={sellerLabel}>🛒 City Sellers</p>
          <h2 style={{...sellerCount,color:"#16a34a"}}>{citySellers.length}</h2>
          <div style={sellerList}>
            {citySellers.length===0
              ? <span style={emptyText}>Koi nahi</span>
              : citySellers.map(s=>(
                <div key={s._id} style={sellerItem}>
                  <span style={sellerName}>{s.name||"—"}</span>
                  <span style={{...locationPill,background:"#f0fdf4",color:"#16a34a",border:"1px solid #c6e8c6"}}>
                    📍 {s.location||"—"}
                  </span>
                </div>
              ))
            }
          </div>
        </div>

        <div style={{...sellerBox, borderTop:"4px solid #f97316"}}>
          <p style={sellerLabel}>🏭 Thok Mandi Sellers</p>
          <h2 style={{...sellerCount,color:"#f97316"}}>{thokSellers.length}</h2>
          <div style={sellerList}>
            {thokSellers.length===0
              ? <span style={emptyText}>Koi nahi</span>
              : thokSellers.map(s=>(
                <div key={s._id} style={sellerItem}>
                  <span style={sellerName}>{s.name||"—"}</span>
                  <span style={{...locationPill,background:"#fff7ed",color:"#f97316",border:"1px solid #fed7aa"}}>
                    🏭 {s.location||"—"}
                  </span>
                </div>
              ))
            }
          </div>
        </div>

      </div>

      {/* SALES GRAPH */}
      <h3 style={{marginTop:40,marginBottom:14,fontSize:17,color:"#374151"}}>📈 Sales Graph</h3>

      <div style={graphBox} className="admindash-graph">
        <Bar label="Orders" value={data.totalOrders||0} max={max}/>
        <Bar label="Today" value={data.today||0} max={max}/>
        <Bar label="Sales ₹" value={data.totalSales||0} max={max}/>
      </div>

      {/* PENDING ORDERS */}
      <div style={{marginTop:40}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10}}>
          <h3 style={{fontSize:17,color:"#374151",margin:0}}>
            ⏳ Pending Orders
            <span style={{marginLeft:10,background:"#fef3c7",color:"#92400e",fontSize:13,fontWeight:700,padding:"3px 10px",borderRadius:999}}>
              {pending.length} pending
            </span>
          </h3>
          <button style={{...toggleBtn,background:"#92400e"}} onClick={()=>setShowPending(p=>!p)}>
            {showPending?"▲ Hide":"▼ Show All"}
          </button>
        </div>

        {showPending && (
          pending.length === 0
          ? <p style={{color:"#aaa",fontSize:14}}>Koi pending order nahi.</p>
          : <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {pending.map(o=>{
                const allSellers=[...(o.citySellers||[]),...(o.thokSellers||[])].filter(s=>s.name||s.phone);
                return (
                  <div key={o._id} style={{...dCard,borderLeftColor:"#f59e0b"}}>
                    <div style={dHeader}>
                      <div>
                        <span style={{...dDate,color:"#92400e"}}>{fmtDateTime(o.createdAt)}</span>
                        <span style={dLoc}>📍 {o.location||"—"}</span>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <span style={{...dTotal,color:"#92400e"}}>₹{o.totalPrice}</span>
                        <div style={{marginTop:4}}>
                          <span style={{fontSize:11,background:"#fef3c7",color:"#92400e",padding:"2px 8px",borderRadius:999,fontWeight:700}}>⏳ Pending</span>
                        </div>
                      </div>
                    </div>
                    <div style={dGrid}>
                      <div style={dBlock}>
                        <p style={dBlockTitle}>👤 Buyer</p>
                        <p style={dName}>{o.name||"—"}</p>
                        <p style={dPhone}>📞 {o.phone||"—"}</p>
                        {o.address&&<p style={dAddr}>🏠 {o.address}</p>}
                      </div>
                      <div style={dBlock}>
                        <p style={dBlockTitle}>🧑‍🌾 Seller(s)</p>
                        {allSellers.length===0
                          ?<p style={{color:"#aaa",fontSize:13}}>Info nahi</p>
                          :allSellers.map((s,i)=>(
                            <div key={i} style={{marginBottom:6}}>
                              <p style={dName}>{s.name||"—"}</p>
                              {s.phone&&<p style={dPhone}>📞 {s.phone}</p>}
                            </div>
                          ))
                        }
                      </div>
                      <div style={dBlock}>
                        <p style={dBlockTitle}>📦 Items</p>
                        {(o.items||[]).map((x,i)=>(
                          <p key={i} style={dItem}>• {x.name} × {x.qty}</p>
                        ))}
                        <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"}}>
                          <span style={{...dAmtBox,background:"#fef3c7",color:"#92400e"}}>Adv: ₹{o.advancePaid||0}</span>
                          <span style={{...dAmtBox,background:"#fff7ed",color:"#c2410c"}}>Baaki: ₹{o.totalPrice-(o.advancePaid||0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
        )}
      </div>

      {/* DELIVERED ORDERS HISTORY */}
      <div style={{marginTop:40}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10}}>
          <h3 style={{fontSize:17,color:"#374151",margin:0}}>
            ✅ Delivered Orders History
            <span style={{marginLeft:10,background:"#dcfce7",color:"#166534",fontSize:13,fontWeight:700,padding:"3px 10px",borderRadius:999}}>
              {delivered.length} total
            </span>
          </h3>
          <button
            style={toggleBtn}
            onClick={()=>setShowDelivered(p=>!p)}
          >
            {showDelivered ? "▲ Hide" : "▼ Show All"}
          </button>
        </div>

        {showDelivered && (
          delivered.length === 0
          ? <p style={{color:"#aaa",fontSize:14}}>Koi delivered order nahi abhi tak.</p>
          : <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {delivered.map(o=>{
                const sellers = [
                  ...(o.citySellers||[]),
                  ...(o.thokSellers||[])
                ].filter(s=>s.name||s.phone);
                return (
                  <div key={o._id} style={dCard}>

                    {/* Header row */}
                    <div style={dHeader}>
                      <div>
                        <span style={dDate}>{fmtDateTime(o.createdAt)}</span>
                        <span style={dLoc}>📍 {o.location||"—"}</span>
                      </div>
                      <span style={dTotal}>₹{o.totalPrice}</span>
                    </div>

                    <div style={dGrid}>

                      {/* Buyer */}
                      <div style={dBlock}>
                        <p style={dBlockTitle}>👤 Buyer</p>
                        <p style={dName}>{o.name||"—"}</p>
                        <p style={dPhone}>📞 {o.phone||"—"}</p>
                        {o.address && <p style={dAddr}>🏠 {o.address}</p>}
                      </div>

                      {/* Seller(s) */}
                      <div style={dBlock}>
                        <p style={dBlockTitle}>🧑‍🌾 Seller(s)</p>
                        {sellers.length === 0
                          ? <p style={{color:"#aaa",fontSize:13}}>Info saved nahi</p>
                          : sellers.map((s,i)=>(
                            <div key={i} style={{marginBottom:6}}>
                              <p style={dName}>{s.name||"—"}</p>
                              {s.phone && <p style={dPhone}>📞 {s.phone}</p>}
                            </div>
                          ))
                        }
                      </div>

                      {/* Items */}
                      <div style={dBlock}>
                        <p style={dBlockTitle}>📦 Items</p>
                        {(o.items||[]).map((x,i)=>(
                          <p key={i} style={dItem}>• {x.name} × {x.qty}</p>
                        ))}
                        <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"}}>
                          <span style={dAmtBox}>Adv: ₹{o.advancePaid||0}</span>
                          <span style={{...dAmtBox,background:"#fff7ed",color:"#c2410c"}}>
                            Baaki: ₹{o.totalPrice-(o.advancePaid||0)}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
        )}
      </div>

    </div>
  );
}

function Card({title,value}){
  return(
    <div style={card} className="admindash-card">
      <p style={{color:"#777"}}>{title}</p>
      <h2>{value||0}</h2>
    </div>
  );
}

function Bar({label,value,max}){

  const height = max ? (value/max)*100 : 0;

  return(
    <div style={barWrap}>

      <div style={barBg}>
        <div style={{...barFill,height:height+"%"}} className="admindash-fill"></div>
      </div>

      <b>{label}</b>
      <small>{value}</small>

    </div>
  );
}

/* INLINE STYLES (UNCHANGED) */

const wrap={
  padding:20,
  background:"#f3f4f6",
  minHeight:"100vh"
};

const cards={
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
  gap:15
};

const card={
  background:"#fff",
  padding:20,
  borderRadius:12,
  boxShadow:"0 2px 8px rgba(0,0,0,.1)"
};

const graphBox={
  marginTop:20,
  display:"flex",
  justifyContent:"space-around",
  alignItems:"flex-end",
  gap:20,
  background:"#fff",
  padding:20,
  borderRadius:14,
  boxShadow:"0 2px 8px rgba(0,0,0,.1)",
  minHeight:250
};

const barWrap={
  display:"flex",
  flexDirection:"column",
  alignItems:"center",
  gap:6,
  width:80
};

const barBg={
  width:40,
  height:160,
  background:"#e5e7eb",
  borderRadius:10,
  overflow:"hidden",
  display:"flex",
  alignItems:"flex-end"
};

const barFill={
  width:"100%",
  background:"#16a34a",
  borderRadius:10,
  transition:"0.4s"
};

const sellerRow={
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
  gap:16
};

const sellerBox={
  background:"#fff",
  borderRadius:14,
  padding:"18px 20px",
  boxShadow:"0 2px 8px rgba(0,0,0,.08)"
};

const sellerLabel={
  color:"#666",
  fontSize:13,
  fontWeight:600,
  margin:"0 0 4px"
};

const sellerCount={
  margin:"0 0 14px",
  fontSize:32,
  fontWeight:800
};

const sellerList={
  display:"flex",
  flexDirection:"column",
  gap:8,
  maxHeight:220,
  overflowY:"auto"
};

const sellerItem={
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  gap:8,
  padding:"8px 12px",
  background:"#f9fafb",
  borderRadius:10,
  flexWrap:"wrap"
};

const sellerName={
  fontWeight:700,
  fontSize:14,
  color:"#1a1a1a"
};

const locationPill={
  fontSize:12,
  fontWeight:600,
  padding:"3px 10px",
  borderRadius:100
};

const emptyText={
  fontSize:13,
  color:"#aaa"
};

const toggleBtn={
  padding:"8px 18px",background:"#1e293b",color:"#fff",
  border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"
};

const dCard={
  background:"#fff",borderRadius:16,
  padding:"18px 20px",
  boxShadow:"0 2px 10px rgba(0,0,0,.07)",
  borderLeft:"4px solid #22c55e"
};

const dHeader={
  display:"flex",justifyContent:"space-between",alignItems:"center",
  marginBottom:14,flexWrap:"wrap",gap:8
};

const dDate={
  fontSize:13,fontWeight:700,color:"#374151",marginRight:10
};

const dLoc={
  fontSize:12,color:"#64748b",
  background:"#f1f5f9",padding:"2px 8px",borderRadius:999
};

const dTotal={
  fontSize:18,fontWeight:800,color:"#166534"
};

const dGrid={
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
  gap:14
};

const dBlock={
  background:"#f8fafc",borderRadius:12,padding:"12px 14px"
};

const dBlockTitle={
  fontSize:11,fontWeight:700,color:"#94a3b8",
  textTransform:"uppercase",letterSpacing:1,marginBottom:8
};

const dName={ fontSize:14,fontWeight:700,color:"#1a1a1a",marginBottom:2 };
const dPhone={ fontSize:13,color:"#2563eb",fontWeight:600,marginBottom:2 };
const dAddr={ fontSize:12,color:"#64748b" };
const dItem={ fontSize:13,color:"#475569",marginBottom:3 };

const dAmtBox={
  fontSize:12,fontWeight:700,
  background:"#dcfce7",color:"#166534",
  padding:"3px 10px",borderRadius:999
};
