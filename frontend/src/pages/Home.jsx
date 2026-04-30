import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import "./Home.css";   // ✅ CSS Added (logic untouched)

const API = import.meta.env.VITE_API;

export default function Home(){

  const [products,setProducts]=useState([]);
  const [search,setSearch]=useState("");

  async function fetchProducts(){
    const res = await fetch(`${API}/api/products`);
    const data = await res.json();
    setProducts(data);
  }

  useEffect(()=>{
    fetchProducts();
  },[]);

  const filtered = products.filter(p =>
    (p.name||"").toLowerCase().includes(search.toLowerCase())
  );

  return(
    <div style={wrap} className="home-wrap">

      {/* HERO */}

      <div style={hero} className="home-hero">

        <div>
          <h1 style={{marginBottom:6}} className="home-title">
            🥦 Fresh Vegetables
          </h1>
          <p className="home-sub">
            Buy direct from farmers — Fresh, Cheap, Healthy.
          </p>
        </div>

        <input
          style={searchBox}
          className="home-search"
          placeholder="Search vegetables..."
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />

      </div>

      {/* PRODUCTS */}

      <div style={grid} className="home-grid">

        {filtered.map(p=>(
          <ProductCard key={p._id} product={p}/>
        ))}

      </div>

    </div>
  );
}

/* RESPONSIVE (existing styles untouched) */

const wrap={
  padding:20,
  background:"#f3f4f6",
  minHeight:"100vh"
};

const hero={
  background:"#fff",
  padding:20,
  borderRadius:16,
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  flexWrap:"wrap",
  gap:15,
  boxShadow:"0 2px 8px rgba(0,0,0,.1)",
  marginBottom:25
};

const searchBox={
  padding:12,
  borderRadius:12,
  border:"1px solid #ddd",
  width:"100%",
  maxWidth:280
};

const grid={
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
  gap:20
};
