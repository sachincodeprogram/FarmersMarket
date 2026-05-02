import { useState } from "react";
import "./AdminAddProduct.css";

const API = import.meta.env.VITE_API || "http://localhost:5000";

// Bharat ki cities — same as Home.jsx
const CITIES = [
  "Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore",
  "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
  "Noida", "Gurgaon",
];

export default function AdminAddProduct(){

  const [name,setName]=useState("");
  const [price,setPrice]=useState("");
  const [location,setLocation]=useState("");
  const [image,setImage]=useState(null);
  const [video,setVideo]=useState(null);
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState("");

  const save = async ()=>{

    if(!name||!price||!image||!video){
      setMsg("❌ Sab fields fill karo");
      return;
    }

    if(!location){
      setMsg("❌ City chuniye — kis market ke liye product hai?");
      return;
    }

    if(video.size > 50 * 1024 * 1024){
      setMsg("❌ Video must be under 50MB");
      return;
    }

    setLoading(true);
    setMsg("");

    try{

      const fd = new FormData();
      fd.append("name",name);
      fd.append("price",price);
      fd.append("location",location);
      fd.append("image",image);
      fd.append("video",video);

      const res = await fetch(`${API}/api/products/add`,{
        method:"POST",
        body:fd
      });

      if(!res.ok) throw new Error("Upload failed");

      setMsg("✅ Product successfully add ho gaya — " + location + " market mein");

      setName("");
      setPrice("");
      setLocation("");
      setImage(null);
      setVideo(null);

    }catch(err){
      console.log(err);
      setMsg("❌ Upload error / server problem");
    }

    setLoading(false);
  };

  return(
    <div style={wrap} className="adminadd-wrap">

      <div style={card} className="adminadd-card">

        <h2>➕ Add Product</h2>

        <input
          placeholder="Product Name"
          value={name}
          onChange={e=>setName(e.target.value)}
          style={input}
          className="adminadd-input"
        />

        <input
          type="number"
          placeholder="Price (₹ per kg)"
          value={price}
          onChange={e=>setPrice(e.target.value)}
          style={input}
          className="adminadd-input"
        />

        {/* ✅ NEW — City / Location selector */}
        <select
          style={{...input, color: location ? "#333" : "#888", cursor:"pointer"}}
          value={location}
          onChange={e=>setLocation(e.target.value)}
        >
          <option value="">📍 City chuniye (Market Location)</option>
          {CITIES.map(c=>(
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label style={fileBox} className="adminadd-file">
          📷 Select Image
          <input type="file" hidden accept="image/*" onChange={e=>setImage(e.target.files[0])}/>
        </label>

        {image && <small style={{color:"#16a34a"}}>✅ Image: {image.name}</small>}

        <label style={fileBox} className="adminadd-file">
          🎥 Select Video (max 50MB)
          <input type="file" hidden accept="video/*" onChange={e=>setVideo(e.target.files[0])}/>
        </label>

        {video && <small style={{color:"#16a34a"}}>✅ Video: {video.name}</small>}

        <button onClick={save} style={btn} className="adminadd-btn" disabled={loading}>
          {loading ? "⏳ Uploading..." : "Upload Product"}
        </button>

        {loading && <div style={spinner}></div>}

        {msg && (
          <div style={{
            ...toast,
            color: msg.startsWith("✅") ? "#16a34a" : "#dc2626",
            background: msg.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
            padding: "10px 14px",
            borderRadius: 10,
            marginTop: 14
          }} className="adminadd-toast">
            {msg}
          </div>
        )}

      </div>

    </div>
  );
}

/* STYLES */

const wrap={
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  background:"#f3f4f6",
  padding:20
};

const card={
  background:"#fff",
  padding:28,
  borderRadius:18,
  width:"100%",
  maxWidth:420,
  boxShadow:"0 10px 25px rgba(0,0,0,.12)",
  textAlign:"center"
};

const input={
  width:"100%",
  padding:14,
  marginTop:12,
  borderRadius:10,
  border:"1px solid #ddd",
  fontSize:15,
  boxSizing:"border-box"
};

const fileBox={
  marginTop:12,
  display:"block",
  padding:12,
  border:"2px dashed #16a34a",
  borderRadius:10,
  cursor:"pointer",
  color:"#16a34a",
  fontWeight:600
};

const btn={
  marginTop:18,
  width:"100%",
  padding:14,
  border:"none",
  borderRadius:12,
  background:"#16a34a",
  color:"#fff",
  fontWeight:700,
  cursor:"pointer",
  fontSize:16
};

const toast={
  marginTop:15,
  fontWeight:600
};

const spinner={
  margin:"15px auto",
  width:38,
  height:38,
  border:"4px solid #eee",
  borderTop:"4px solid #16a34a",
  borderRadius:"50%",
  animation:"spin 1s linear infinite"
};

const style=document.createElement("style");
style.innerHTML=`
@keyframes spin{
  from{transform:rotate(0deg);}
  to{transform:rotate(360deg);}
}
`;
document.head.appendChild(style);