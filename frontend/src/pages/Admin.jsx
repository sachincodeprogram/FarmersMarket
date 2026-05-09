import { useEffect, useState } from "react";
import axios from "axios";
import "./Admin.css";   // ✅ CSS Added

const API = import.meta.env.VITE_API;

export default function Admin() {

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await axios.get(`${API}/api/orders/admin`);
    setOrders(res.data);
  }

  const totalItems = orders.reduce((s,o)=>s+o.totalQty,0);
  const totalAmount = orders.reduce((s,o)=>s+o.totalPrice,0);
  const totalAdvance = orders.reduce((s,o)=>s+(o.advancePaid||0),0);

  return (
    <div style={wrap} className="admin-wrap">

      <h2 style={{marginBottom:20}}>📊 Admin Dashboard</h2>

      {/* TOP CARDS */}
      <div style={grid}>

        <Card title="Orders" value={orders.length}/>
        <Card title="Items" value={totalItems}/>
        <Card title="Revenue" value={"₹"+totalAmount}/>
        <Card title="Advance Rec." value={"₹"+totalAdvance}/>

      </div>

      <h3 style={{margin:"30px 0"}}>Pending Orders</h3>

      {orders.map(o=>(

        <div key={o._id} style={orderCard} className="admin-order">

          <div style={row} className="admin-row">

            <div>
              <b>{o.name}</b>
              <p style={{fontSize:13,color:"#666"}}>UID: {o.uid}</p>
              <p>📞 {o.phone}</p>
              <p>🏠 {o.address}</p>
            </div>

            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
              <span style={status} className="admin-status">{o.status}</span>
              {o.thokSellers && o.thokSellers.length > 0
                ? <span style={thokBadge}>🏭 Thok Mandi</span>
                : <span style={cityBadge}>🛒 City Seller</span>
              }
            </div>

          </div>

          <hr style={{margin:"15px 0"}}/>

          <b>Items</b>

          {o.items.map((x,i)=>(
            <div key={i}>
              {x.name} × {x.qty}
            </div>
          ))}

          <p style={{marginTop:10}}>Total Qty: {o.totalQty}</p>

          <p><b>Total:</b> ₹{o.totalPrice}</p>
          <p><b>25% Paid:</b> ₹{o.advancePaid||0}</p>
          <p><b>Pending:</b> ₹{o.totalPrice - (o.advancePaid||0)}</p>

          <button
            style={btn}
            className="admin-btn"
            onClick={async()=>{
              await axios.put(`${API}/api/orders/deliver/`+o._id);
              load();
            }}
          >
            Mark Delivered
          </button>

        </div>

      ))}

    </div>
  );
}

function Card({title,value}){
  return(
    <div style={card} className="admin-card">
      <p style={{color:"#777"}}>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

/* INLINE STYLES (UNCHANGED) */

const wrap={
  padding:20,
  background:"#f3f4f6",
  minHeight:"100vh"
};

const grid={
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
  gap:15
};

const card={
  background:"#fff",
  padding:18,
  borderRadius:14,
  boxShadow:"0 2px 8px rgba(0,0,0,.1)"
};

const orderCard={
  background:"#fff",
  padding:20,
  borderRadius:14,
  marginBottom:20,
  boxShadow:"0 2px 8px rgba(0,0,0,.1)"
};

const row={
  display:"flex",
  justifyContent:"space-between",
  flexWrap:"wrap",
  gap:10
};

const status={
  height:28,
  padding:"4px 12px",
  borderRadius:20,
  background:"#fef3c7",
  color:"#92400e"
};

const btn={
  marginTop:12,
  background:"#16a34a",
  color:"#fff",
  border:"none",
  padding:"12px 20px",
  borderRadius:10,
  cursor:"pointer",
  width:"100%",
  fontWeight:600
};

const cityBadge={
  padding:"4px 12px",
  borderRadius:20,
  background:"#f0fdf4",
  color:"#16a34a",
  border:"1px solid #c6e8c6",
  fontSize:12,
  fontWeight:700
};

const thokBadge={
  padding:"4px 12px",
  borderRadius:20,
  background:"#fff7ed",
  color:"#c2410c",
  border:"1px solid #fed7aa",
  fontSize:12,
  fontWeight:700
};
