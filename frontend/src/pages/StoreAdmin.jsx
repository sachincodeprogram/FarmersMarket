import { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const API = import.meta.env.VITE_API;

export default function StoreAdmin(){

  const [items,setItems]=useState([]);
  const [name,setName]=useState("");
  const [kg,setKg]=useState(1);
  const [search,setSearch]=useState("");

  useEffect(()=>{load()},[]);

  const load = async()=>{
    const {data}=await axios.get(`${API}/api/store`);
    setItems(data);
  };

  const addItem = async()=>{
    if(!name) return alert("Enter item name");
    await axios.post(`${API}/api/store/add`,{name,kg:Number(kg)});
    setName(""); setKg(1); load();
  };

  const remove = async(id)=>{
    if(!window.confirm("Remove item?")) return;
    await axios.delete(`${API}/api/store/${id}`);
    load();
  };

  const changeKg = async(id,kg)=>{
    if(kg<0)return;
    await axios.put(`${API}/api/store/${id}`,{kg});
    load();
  };

  const totalKg = items.reduce((a,b)=>a+b.kg,0);

  const today = new Date().toDateString();
  const todayItems = items.filter(i =>
    new Date(i.createdAt).toDateString()===today
  );

  const exportCSV = ()=>{
    const rows=[["Item","KG"]];
    items.forEach(i=>rows.push([i.name,i.kg]));
    const csv=rows.map(r=>r.join(",")).join("\n");
    const blob=new Blob([csv]);
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download="stock.csv";a.click();
  };

  const graphData = items.map(i=>({ name:i.name, kg:i.kg }));

  return(
    <div style={wrap}>

      <h2 style={title}>📦 Store Dashboard</h2>

      {/* SUMMARY */}
      <div style={summaryGrid}>
        <div style={card}>Total Stock<br/><b>{totalKg} KG</b></div>
        <div style={card}>Today Added<br/><b>{todayItems.length}</b></div>
        <button onClick={exportCSV} style={exportBtn}>Export CSV</button>
      </div>

      {/* ADD */}
      <div style={formRow}>
        <input style={input} placeholder="Item" value={name} onChange={e=>setName(e.target.value)}/>
        <input style={input} type="number" value={kg} onChange={e=>setKg(e.target.value)}/>
        <button onClick={addItem} style={addBtn}>Add</button>
        <input style={input} placeholder="Search" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {/* ITEMS */}
      {items.filter(i=>i.name.toLowerCase().includes(search.toLowerCase())).map(i=>(
        <div key={i._id} style={rowCard}>
          <b>{i.name}</b>
          <span style={kgText}>{i.kg} KG</span>

          <div>
            <button onClick={()=>changeKg(i._id,i.kg-1)} style={miniBtn}>−</button>
            <button onClick={()=>changeKg(i._id,i.kg+1)} style={miniBtn}>+</button>
          </div>

          <button onClick={()=>remove(i._id)} style={delBtn}>Remove</button>
        </div>
      ))}

      {/* GRAPH */}
      <h3 style={{marginTop:30}}>📊 Stock Graph</h3>

      <div style={graphBox}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={graphData}>
            <XAxis dataKey="name"/>
            <YAxis/>
            <Tooltip/>
            <Line dataKey="kg" stroke="#16a34a" strokeWidth={3}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

/* 🎨 PROFESSIONAL RESPONSIVE STYLE (NO LOGIC CHANGE) */

const wrap={
  padding:"clamp(16px,3vw,40px)",
  background:"#f1f5f9",
  minHeight:"100vh",
  maxWidth:"1200px",
  margin:"auto"
};

const title={
  marginBottom:25,
  fontSize:"clamp(20px,2.5vw,28px)",
  fontWeight:"700",
  color:"#0f172a"
};

const summaryGrid={
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
  gap:18,
  marginBottom:25
};

const card={
  background:"#fff",
  padding:20,
  borderRadius:16,
  boxShadow:"0 10px 25px rgba(0,0,0,.05)",
  border:"1px solid #e2e8f0"
};

const exportBtn={
  background:"linear-gradient(135deg,#22c55e,#16a34a)",
  color:"#fff",
  border:"none",
  borderRadius:14,
  padding:14,
  fontWeight:600,
  cursor:"pointer"
};

const formRow={
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
  gap:12,
  marginBottom:25
};

const input={
  padding:13,
  borderRadius:12,
  border:"1px solid #d1d5db",
  fontSize:14
};

const addBtn={
  background:"linear-gradient(135deg,#2563eb,#1d4ed8)",
  color:"#fff",
  border:"none",
  borderRadius:12,
  padding:13,
  fontWeight:600,
  cursor:"pointer"
};

const rowCard={
  background:"#fff",
  padding:18,
  borderRadius:14,
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  flexWrap:"wrap",
  gap:12,
  marginBottom:12,
  boxShadow:"0 6px 16px rgba(0,0,0,.05)"
};

const miniBtn={
  margin:2,
  padding:"6px 12px",
  borderRadius:8,
  border:"none",
  background:"#16a34a",
  color:"#fff",
  cursor:"pointer"
};

const delBtn={
  background:"#dc2626",
  color:"#fff",
  border:"none",
  borderRadius:8,
  padding:"8px 14px",
  cursor:"pointer"
};

const kgText={
  fontWeight:600,
  color:"#334155"
};

const graphBox={
  marginTop:12,
  background:"#fff",
  padding:20,
  borderRadius:16,
  boxShadow:"0 10px 25px rgba(0,0,0,.05)"
};
//sachin//