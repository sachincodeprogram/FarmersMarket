import axios from "axios";
import { useState } from "react";

const API = import.meta.env.VITE_API;   // ✅ ONLY ADDED

export default function AdvancePayment({ price, onSuccess }) {

  const [loading,setLoading]=useState(false);

  const pay = async () => {
    if(loading) return;

    setLoading(true);

    try{
      const { data } = await axios.post(`${API}/api/payment/create-order`, {   // ✅ CHANGED
        price
      });

      const options = {
        key: data.key,
        amount: data.total * 100,
        currency: "INR",
        order_id: data.orderId,

        handler: async (response) => {
          await axios.post(`${API}/api/payment/verify`, response);   // ✅ CHANGED

          setLoading(false);

          if (onSuccess) onSuccess();

          alert("✅ 25% Payment Successful");
        },

        modal:{
          ondismiss:()=>setLoading(false)
        }
      };

      new window.Razorpay(options).open();

    }catch(err){
      setLoading(false);
      alert("❌ Payment Failed");
    }
  };

  return (
    <div style={wrap}>
      <button onClick={pay} disabled={loading} style={btn}>
        {loading ? "Processing..." : "💳 Pay 25% Advance"}
      </button>
    </div>
  );
}

/* PROFESSIONAL RESPONSIVE */

const wrap={
  width:"100%",
  display:"flex",
  justifyContent:"center",
  marginTop:15
};

const btn={
  width:"100%",
  maxWidth:420,
  padding:"15px 22px",
  background:"#2563eb",
  color:"#fff",
  border:"none",
  borderRadius:14,
  fontSize:18,
  fontWeight:600,
  cursor:"pointer",
  boxShadow:"0 6px 15px rgba(37,99,235,.35)"
};
