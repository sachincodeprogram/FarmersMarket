import { useEffect,useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";   // ✅ CSS Added

const API = import.meta.env.VITE_API;

export default function AdminDashboard(){

  const [data,setData]=useState({});

  useEffect(()=>{
    axios.get(`${API}/api/orders/admin/summary`)
      .then(res=>setData(res.data));
  },[]);

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

      {/* SALES GRAPH */}

      <h3 style={{marginTop:40}}>Sales Graph</h3>

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
