import { useContext } from "react";
import { BagContext } from "./BagContext";
import AdvancePayment from "./AdvancePayment";

export default function Bag(){

  const {
    bagItems,
    increaseQty,
    decreaseQty,
    removeFromBag,
    clearBag
  } = useContext(BagContext);

  const total = bagItems.reduce((a,b)=>a+(b.price*b.qty),0);

  if(!bagItems.length)
    return <h2 style={{padding:40}}>🛒 Your bag is empty</h2>;

  return(
    <div style={wrap}>

      <div style={list}>

        {bagItems.map(p=>(
          <div key={p._id} style={row}>

            <img src={p.image} style={img}/>

            <div style={{flex:1}}>
              <b>{p.name}</b>
              <div>₹{p.price}</div>

              <div style={qtyWrap}>
                <button onClick={()=>decreaseQty(p._id)} style={qtyBtn}>−</button>
                <span>{p.qty}</span>
                <button onClick={()=>increaseQty(p._id)} style={qtyBtn}>+</button>
              </div>
            </div>

            <div>
              ₹{p.price * p.qty}
              <div onClick={()=>removeFromBag(p._id)} style={remove}>Remove</div>
            </div>

          </div>
        ))}

        <div onClick={clearBag} style={clear}>Clear Bag</div>

      </div>

      <div style={summary}>

        <h3>Order Summary</h3>

        <div style={line}>
          <span>Total Items</span>
          <b>{bagItems.length}</b>
        </div>

        <div style={line}>
          <span>Total Amount</span>
          <b>₹{total}</b>
        </div>

        <AdvancePayment price={total}/>

      </div>

    </div>
  );
}

/* PROFESSIONAL RESPONSIVE UI */

const wrap={
  padding:20,
  display:"flex",
  flexWrap:"wrap",
  gap:20
};

const list={
  flex:2,
  minWidth:280
};

const row={
  background:"#fff",
  padding:15,
  borderRadius:12,
  display:"flex",
  gap:15,
  marginBottom:15,
  boxShadow:"0 4px 10px rgba(0,0,0,.1)"
};

const img={
  width:70,
  height:70,
  objectFit:"cover",
  borderRadius:10
};

const qtyWrap={
  display:"flex",
  alignItems:"center",
  gap:10,
  marginTop:8
};

const qtyBtn={
  width:28,
  height:28,
  border:"none",
  borderRadius:6,
  background:"#16a34a",
  color:"#fff",
  cursor:"pointer"
};

const remove={
  color:"red",
  fontSize:13,
  cursor:"pointer",
  marginTop:6
};

const clear={
  marginTop:10,
  color:"#2563eb",
  cursor:"pointer"
};

const summary={
  flex:1,
  minWidth:260,
  background:"#fff",
  padding:20,
  borderRadius:14,
  height:"fit-content",
  boxShadow:"0 6px 15px rgba(0,0,0,.12)"
};

const line={
  display:"flex",
  justifyContent:"space-between",
  margin:"10px 0"
};
