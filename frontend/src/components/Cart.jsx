function Cart({ items = [] }) {

  return (
    <div style={wrap}>

      <h3 style={title}>🛍️ Bag ({items.length})</h3>

      {items.length === 0 && (
        <div style={empty}>No items in cart</div>
      )}

      {items.map((item, index) => (
        <div key={index} style={row}>
          <span style={name}>{item.name}</span>
          <span style={price}>₹{item.price}</span>
        </div>
      ))}

    </div>
  );
}

export default Cart;

/* PROFESSIONAL RESPONSIVE UI */

const wrap={
  background:"#fff",
  padding:15,
  borderRadius:14,
  boxShadow:"0 4px 12px rgba(0,0,0,.12)",
  maxWidth:400,
  width:"100%"
};

const title={
  marginBottom:10,
  fontSize:18
};

const empty={
  textAlign:"center",
  padding:15,
  color:"#777"
};

const row={
  display:"flex",
  justifyContent:"space-between",
  padding:"10px 0",
  borderBottom:"1px solid #eee",
  fontSize:15
};

const name={
  maxWidth:"70%",
  overflow:"hidden",
  textOverflow:"ellipsis",
  whiteSpace:"nowrap"
};

const price={
  fontWeight:600
};
