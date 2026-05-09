import { useEffect,useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";   // ✅ CSS Added

const API = import.meta.env.VITE_API;

export default function AdminDashboard(){

  const [data,setData]=useState({});
  const [sellers,setSellers]=useState([]);

  useEffect(()=>{
    axios.get(`${API}/api/orders/admin/summary`)
      .then(res=>setData(res.data));
    axios.get(`${API}/api/users`)
      .then(res=>{
        const allSellers = res.data.filter(u=>u.role==="seller");
        setSellers(allSellers);
      });
  },[]);

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
