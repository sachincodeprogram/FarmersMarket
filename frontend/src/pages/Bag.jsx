import { useEffect, useState } from "react";
import { getBagItems, removeQtyApi } from "../api/bagApi";
import { auth } from "../firebase";
import axios from "axios";
import "./Bag.css";

const API = import.meta.env.VITE_API;

export default function Bag() {

  const [items, setItems] = useState([]);

  async function fetchBag() {
    const data = await getBagItems();
    setItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    fetchBag();
  }, []);

  async function removeOneQty(item) {
    await removeQtyApi(item.productId, item.price);
    fetchBag();
  }

  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);

  async function placeOrder() {

    const uid = auth.currentUser.uid;

    await axios.post(`${API}/api/orders/create`, {
      uid,
      totalPrice
    });

    alert("Order placed successfully");
    window.location.href = "/orders";
  }

  return (
    <div style={wrap} className="bag-wrap">

      <h2 className="bag-title">🛒 Your Bag</h2>

      {items.length === 0 ? (
        <p>Bag खाली है</p>
      ) : (
        <>
          {items.map(item => (
            <div key={item._id} style={itemRow} className="bag-item">

              <img src={item.image} style={img} className="bag-img"/>

              <div style={{flex:1}}>
                <b>{item.name}</b>
                <p>Qty: {item.qty}</p>
                <p style={{color:"#16a34a",fontWeight:600}}>₹{item.price}</p>
              </div>

              <button
                style={removeBtn}
                className="bag-remove"
                onClick={()=>removeOneQty(item)}
              >
                Remove
              </button>

            </div>
          ))}

          <div style={summary} className="bag-summary">

            <p>Total: ₹{totalPrice}</p>

            <button
              onClick={placeOrder}
              style={{
                marginTop:15,
                background:"#16a34a",
                color:"#fff",
                border:"none",
                padding:"10px 18px",
                borderRadius:10,
                cursor:"pointer",
                fontWeight:600
              }}
            >
              Place Order
            </button>

          </div>
        </>
      )}

    </div>
  );
}

const wrap={
  padding:20,
  background:"#f3f4f6",
  minHeight:"100vh"
};

const itemRow={
  display:"flex",
  gap:12,
  alignItems:"center",
  background:"#fff",
  padding:12,
  borderRadius:12,
  marginBottom:12,
  boxShadow:"0 2px 6px rgba(0,0,0,.1)"
};

const img={
  width:70,
  height:70,
  borderRadius:10,
  objectFit:"cover"
};

const removeBtn={
  background:"#dc2626",
  color:"#fff",
  border:"none",
  padding:"8px 14px",
  borderRadius:10,
  cursor:"pointer",
  fontWeight:600
};

const summary={
  marginTop:20,
  background:"#fff",
  padding:20,
  borderRadius:14,
  boxShadow:"0 2px 8px rgba(0,0,0,.1)"
};