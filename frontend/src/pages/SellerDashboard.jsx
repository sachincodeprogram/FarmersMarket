import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API;

export default function SellerDashboard(){

  const [products,setProducts] = useState([]);

  useEffect(()=>{

    loadProducts();

  },[]);

  const loadProducts = async ()=>{

    try{

      const res = await axios.get(`${API}/api/products`);

      setProducts(res.data);

    }catch(err){

      console.log(err);

    }

  };

  return(

    <div style={{padding:30}}>

      <h2>Seller Dashboard</h2>

      {products.length === 0 && (
        <p>No products found</p>
      )}

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
        gap:20,
        marginTop:20
      }}>

      {products.map(p=>(
        <div key={p._id} style={{
          border:"1px solid #ddd",
          borderRadius:10,
          padding:10,
          background:"#fff"
        }}>

          <img 
            src={p.image} 
            alt={p.name}
            style={{
              width:"100%",
              height:150,
              objectFit:"cover",
              borderRadius:8
            }}
          />

          <h3 style={{marginTop:10}}>{p.name}</h3>

          <p>₹ {p.price}</p>

        </div>
      ))}

      </div>

    </div>

  );

}