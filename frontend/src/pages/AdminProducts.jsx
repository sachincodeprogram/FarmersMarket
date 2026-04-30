import { useEffect, useState } from "react";
import "./AdminProducts.css";

const API = import.meta.env.VITE_API;

export default function AdminProducts(){

  const [products,setProducts]=useState([]);
  const [editId,setEditId]=useState(null);
  const [price,setPrice]=useState("");

  useEffect(()=>{
    load();
  },[]);

  const load = async ()=>{
    const res = await fetch(`${API}/api/products`);
    setProducts(await res.json());
  };

  const del = async(id)=>{
    if(!window.confirm("Delete product?")) return;

    await fetch(`${API}/api/products/`+id,{
      method:"DELETE"
    });

    load();
  };

  const startEdit=(p)=>{
    setEditId(p._id);
    setPrice(p.price);
  };

  const savePrice = async(id)=>{

    if(!price) return alert("Enter price");

    await fetch(`${API}/api/products/`+id,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({price})
    });

    setEditId(null);
    load();
  };

  return(
    <div style={wrap} className="admin-wrap">

      <h2 style={{marginBottom:20}} className="admin-title">📦 All Products</h2>

      {products.map(p=>(

        <div key={p._id} style={row} className="admin-row">

          <img src={p.image} style={img} className="admin-img"/>

          <div style={{flex:1}}>
            <b>{p.name}</b>

            {editId===p._id ? (
              <input
                value={price}
                onChange={e=>setPrice(e.target.value)}
                style={input}
                type="number"
              />
            ):(
              <p style={{color:"#16a34a",fontWeight:600}}>₹{p.price}</p>
            )}

          </div>

          {editId===p._id ? (
            <button onClick={()=>savePrice(p._id)} style={saveBtn} className="admin-save">Save</button>
          ):(
            <button onClick={()=>startEdit(p)} style={editBtn} className="admin-edit">Edit</button>
          )}

          <button onClick={()=>del(p._id)} style={btn} className="admin-delete">Delete</button>

        </div>

      ))}

    </div>
  );
}


/* EXISTING INLINE STYLES (UNCHANGED) */

const wrap={
  padding:20,
  background:"#f3f4f6",
  minHeight:"100vh"
};

const row={
  display:"flex",
  gap:15,
  alignItems:"center",
  marginBottom:12,
  background:"#fff",
  padding:12,
  borderRadius:12,
  boxShadow:"0 2px 6px rgba(0,0,0,.1)"
};

const img={
  width:60,
  height:60,
  objectFit:"cover",
  borderRadius:10
};

const btn={
  background:"#dc2626",
  color:"#fff",
  border:"none",
  padding:"8px 14px",
  borderRadius:10,
  cursor:"pointer",
  fontWeight:600
};

const editBtn={
  background:"#2563eb",
  color:"#fff",
  border:"none",
  padding:"8px 14px",
  borderRadius:10,
  cursor:"pointer",
  fontWeight:600
};

const saveBtn={
  background:"#16a34a",
  color:"#fff",
  border:"none",
  padding:"8px 14px",
  borderRadius:10,
  cursor:"pointer",
  fontWeight:600
};

const input={
  width:90,
  padding:6,
  borderRadius:8,
  border:"1px solid #ccc"
};
