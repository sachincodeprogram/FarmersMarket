import { useState } from "react";
import { addToBagApi } from "../api/bagApi";

export default function ProductCard({ product }) {

  const [toast, setToast] = useState("");
  const [showVideo,setShowVideo]=useState(false);

  async function handleAddToBag() {
    try {
      const productId = String(product?._id || product?.id || "");

      if (!productId) {
        alert("Product ID missing ❌");
        return;
      }

      await addToBagApi({
        _id: productId,
        name: product?.name || "Unknown",
        price: Number(product?.price || 0),
        image: product?.image || "",
      });

      setToast("✅ Added to Bag");
      setTimeout(() => setToast(""), 1200);

    } catch (err) {
      alert(err.message || "❌ Add to bag failed");
    }
  }

  return (
    <div style={card}>

      <div style={badge}>Fresh</div>

      {/* IMAGE / VIDEO */}
      <div onClick={()=>setShowVideo(!showVideo)} style={{cursor:"pointer"}}>

        {!showVideo && (
          <img src={product.image} alt={product.name} style={img}/>
        )}

        {showVideo && product.video && (
          <video
            src={product.video}
            style={img}
            autoPlay
            muted
            loop
            playsInline
          />
        )}

      </div>

      <div style={body}>

        <div style={title}>{product.name}</div>

        <div style={price}>₹ {product.price}</div>

        <button style={btn} onClick={handleAddToBag}>
          Buy / Add to Bag
        </button>

      </div>

      {toast && <div style={toastStyle}>{toast}</div>}

    </div>
  );
}

/* PROFESSIONAL RESPONSIVE */

const card={
  position:"relative",
  background:"#fff",
  borderRadius:16,
  overflow:"hidden",
  boxShadow:"0 6px 15px rgba(0,0,0,.12)",
  width:"100%",
  maxWidth:260,
  margin:"auto"
};

const badge={
  position:"absolute",
  top:10,
  left:10,
  background:"#16a34a",
  color:"#fff",
  padding:"3px 10px",
  borderRadius:12,
  fontSize:12,
  zIndex:1
};

const img={
  width:"100%",
  height:160,
  objectFit:"cover"
};

const body={
  padding:12,
  textAlign:"center"
};

const title={
  fontWeight:600,
  fontSize:16,
  marginBottom:6
};

const price={
  color:"#16a34a",
  fontWeight:700,
  marginBottom:10
};

const btn={
  width:"100%",
  padding:10,
  border:"none",
  borderRadius:10,
  background:"#2563eb",
  color:"#fff",
  cursor:"pointer",
  fontWeight:600
};

const toastStyle={
  position:"absolute",
  bottom:10,
  left:"50%",
  transform:"translateX(-50%)",
  background:"#000",
  color:"#fff",
  padding:"6px 12px",
  borderRadius:10,
  fontSize:12
};
