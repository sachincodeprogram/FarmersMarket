import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

const API = import.meta.env.VITE_API;

const ProductList = () => {

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <div style={wrap}>

      {products.map(p => (
        <ProductCard key={p._id} product={p} />
      ))}

    </div>
  );
};

export default ProductList;

/* PROFESSIONAL RESPONSIVE GRID */

const wrap={
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
  gap:20,
  padding:20,
  maxWidth:1200,
  margin:"auto"
};
